from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
import os
import uuid
import httpx
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

app = FastAPI(title="Longhorn Solar Energy Estimator API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# Email whitelist for authorization
ALLOWED_EMAILS = [
    "richard.balius@gmail.com",
    "richard@rbvital.com"
]
ALLOWED_DOMAINS = ["longhornsolar.com"]


# ============== MODELS ==============

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: Optional[datetime] = None


class SiteAddress(BaseModel):
    address1: str = ""
    address2: str = ""
    city: str = ""
    state: str = "TX"
    zip: str = ""


class BidItem(BaseModel):
    serviceName: str
    selected: bool = False
    estCost: float = 0
    details: Dict[str, Any] = {}
    notes: str = ""
    aiRecommendations: str = ""


class Project(BaseModel):
    project_id: str
    user_id: str
    bids: Dict[str, BidItem]
    clientName: str
    projectDate: str
    status: str = "QUOTING"
    siteAddress: SiteAddress
    phoneNumber: str = ""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ProjectCreate(BaseModel):
    clientName: str
    phoneNumber: str = ""
    siteAddress: Optional[SiteAddress] = None


class ProjectUpdate(BaseModel):
    clientName: Optional[str] = None
    phoneNumber: Optional[str] = None
    siteAddress: Optional[SiteAddress] = None
    status: Optional[str] = None


class BidUpdate(BaseModel):
    serviceName: str
    selected: Optional[bool] = None
    estCost: Optional[float] = None
    details: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    aiRecommendations: Optional[str] = None


class AIRecommendationRequest(BaseModel):
    serviceName: str
    notes: str
    otherSelectedServices: List[str]


# ============== SERVICES DATABASE ==============

SERVICES_DB = {
    "Energy Audit": {
        "desc": "Identify where a building wastes energy (air leaks, poor insulation).",
        "details": ["Building Sq Ft", "Year Built", "Blower Door Test Required?", "Infrared Scan Required?"]
    },
    "Insulation": {
        "desc": "R-30 to R-38 recommended for Central Texas. 12-18 inches depth.",
        "details": ["Attic Sq Ft", "Current R-Value", "Target R-Value", "Material (Fiberglass/Cellulose/Spray)"]
    },
    "Duct Sealing": {
        "desc": "Leaky ducts can cause 20-30% loss of conditioned air.",
        "details": ["System Age (Years)", "Number of Returns", "Accessible?", "Leakage Test Result (%)"]
    },
    "Weather stripping": {
        "desc": "Sealing doors and windows.",
        "details": ["Number of Exterior Doors", "Number of Windows", "Door Material", "Gap Size (inches)"]
    },
    "LED Light Bulbs": {
        "desc": "High efficiency lighting upgrades.",
        "details": ["Bulb Count", "Base Type (E26, GU10, etc.)", "Color Temp (3000K, 5000K)"]
    },
    "Smart Thermostat": {
        "desc": "Ecobee or Nest installation.",
        "details": ["Brand Preference", "Number of Zones", "C-Wire Present?", "WiFi Signal Strength"]
    },
    "Solar Attic Fans": {
        "desc": "Active ventilation for attics.",
        "details": ["Roof Type (Shingle/Tile)", "Roof Pitch", "Number of Units", "Thermostat Setting"]
    },
    "Radiant Barrier": {
        "desc": "Reflective barrier to reduce heat gain.",
        "details": ["Attic Sq Ft", "Foil Type", "Installation Method (Staple/Paint)"]
    },
    "Solatubes": {
        "desc": "Tubular skylights.",
        "details": ["Tube Diameter (10 or 14 inch)", "Roof Type", "Diffuser Style", "Flashing Type"]
    },
    "Solar Screens": {
        "desc": "Exterior window shading.",
        "details": ["Number of Windows", "Screen Color", "Sun Exposure Direction", "Frame Color"]
    },
    "Electrical Services": {
        "desc": "General electrical upgrades or panel work.",
        "details": ["Panel Amperage", "Service Overhead/Underground", "Permit Required?", "Number of Circuits"]
    },
    "Window Installation": {
        "desc": "Replacement or new windows.",
        "details": ["Count", "Frame Material (Vinyl/Alum)", "Glass Type (Low-E)", "Operation (Single/Double Hung)"]
    },
    "Door Installation": {
        "desc": "Front or rear door replacement.",
        "details": ["Count", "Door Type (Entry/Patio)", "Material (Wood/Steel/Fiberglass)", "Jamb Size"]
    },
    "Water Heater": {
        "desc": "Traditional or tankless hot water solutions.",
        "details": ["Fuel source (Gas/Electric)", "Type (Tank/Tankless)", "Capacity (Gallons/GPM)", "Location"]
    },
    "HVAC/Heat Pump": {
        "desc": "Heating and cooling system.",
        "details": ["Tonnage", "SEER2 Rating", "Furnace Efficiency %", "Existing Ductwork Condition"]
    },
    "Solar": {
        "desc": "PV Solar system.",
        "details": ["System Size (kW)", "Panel Count", "Inverter Type (Micro/String)", "Battery Backup Needed?"]
    },
    "Batteries": {
        "desc": "Energy storage.",
        "details": ["Capacity (kWh)", "Whole Home vs Critical Load", "Mounting Location"]
    },
    "Generators": {
        "desc": "Backup power generation.",
        "details": ["Fuel (Propane/Natural Gas)", "kW Rating", "Transfer Switch Type", "Pad Required?"]
    },
    "Car chargers": {
        "desc": "EV charging stations.",
        "details": ["Charger Level (1 or 2)", "Amperage (30-60A)", "Distance to Panel (ft)"]
    }
}


# ============== AUTH HELPERS ==============

def is_email_authorized(email: str) -> bool:
    """Check if email is in whitelist or allowed domain."""
    email_lower = email.lower().strip()
    
    # Check specific emails
    if email_lower in [e.lower() for e in ALLOWED_EMAILS]:
        return True
    
    # Check domain
    domain = email_lower.split("@")[-1] if "@" in email_lower else ""
    if domain in ALLOWED_DOMAINS:
        return True
    
    return False


async def get_current_user(request: Request) -> User:
    """Get current user from session token (cookie or header)."""
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry with timezone awareness
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)


# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token."""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent auth API to get user data
    async with httpx.AsyncClient() as http_client:
        auth_response = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
    
    if auth_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    
    auth_data = auth_response.json()
    email = auth_data.get("email", "")
    name = auth_data.get("name", "")
    picture = auth_data.get("picture", "")
    session_token = auth_data.get("session_token", "")
    
    # Debug logging
    print(f"AUTH DEBUG: email='{email}', checking authorization...")
    print(f"AUTH DEBUG: ALLOWED_EMAILS={ALLOWED_EMAILS}")
    print(f"AUTH DEBUG: is_authorized={is_email_authorized(email)}")
    
    # Check email authorization
    if not is_email_authorized(email):
        print(f"AUTH DEBUG: REJECTED email '{email}'")
        raise HTTPException(
            status_code=403,
            detail=f"Access denied. Email '{email}' is not authorized."
        )
    
    # Find or create user
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info if needed
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc)
        })
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture
    }


@app.get("/api/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return user


@app.post("/api/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session."""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}


# ============== PROJECT ENDPOINTS ==============

def create_empty_bids() -> Dict[str, dict]:
    """Create empty bids for all services."""
    bids = {}
    for name in SERVICES_DB.keys():
        bids[name] = {
            "serviceName": name,
            "selected": False,
            "estCost": 0,
            "details": {},
            "notes": "",
            "aiRecommendations": ""
        }
    return bids


@app.get("/api/projects")
async def get_projects(user: User = Depends(get_current_user)):
    """Get all projects for current user."""
    projects = await db.projects.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(length=100)
    
    return projects


@app.post("/api/projects", status_code=201)
async def create_project(
    project_data: ProjectCreate,
    user: User = Depends(get_current_user)
):
    """Create a new project."""
    project_id = f"proj_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    project = {
        "project_id": project_id,
        "user_id": user.user_id,
        "bids": create_empty_bids(),
        "clientName": project_data.clientName,
        "projectDate": now.strftime("%Y-%m-%d"),
        "status": "QUOTING",
        "siteAddress": project_data.siteAddress.model_dump() if project_data.siteAddress else {
            "address1": "", "address2": "", "city": "", "state": "TX", "zip": ""
        },
        "phoneNumber": project_data.phoneNumber,
        "created_at": now,
        "updated_at": now
    }
    
    await db.projects.insert_one(project)
    
    # Return without _id
    project.pop("_id", None)
    return project


@app.get("/api/projects/{project_id}")
async def get_project(
    project_id: str,
    user: User = Depends(get_current_user)
):
    """Get a specific project."""
    project = await db.projects.find_one(
        {"project_id": project_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project


@app.put("/api/projects/{project_id}")
async def update_project(
    project_id: str,
    updates: ProjectUpdate,
    user: User = Depends(get_current_user)
):
    """Update project metadata."""
    # Build update dict
    update_data = {"updated_at": datetime.now(timezone.utc)}
    
    if updates.clientName is not None:
        update_data["clientName"] = updates.clientName
    if updates.phoneNumber is not None:
        update_data["phoneNumber"] = updates.phoneNumber
    if updates.siteAddress is not None:
        update_data["siteAddress"] = updates.siteAddress.model_dump()
    if updates.status is not None:
        update_data["status"] = updates.status
    
    result = await db.projects.update_one(
        {"project_id": project_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Return updated project
    project = await db.projects.find_one(
        {"project_id": project_id},
        {"_id": 0}
    )
    return project


@app.delete("/api/projects/{project_id}")
async def delete_project(
    project_id: str,
    user: User = Depends(get_current_user)
):
    """Delete a project."""
    result = await db.projects.delete_one(
        {"project_id": project_id, "user_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project deleted successfully"}


# ============== BID ENDPOINTS ==============

@app.put("/api/projects/{project_id}/bids/{service_name}")
async def update_bid(
    project_id: str,
    service_name: str,
    bid_update: BidUpdate,
    user: User = Depends(get_current_user)
):
    """Update a bid item."""
    # Build update dict
    update_data = {"updated_at": datetime.now(timezone.utc)}
    
    if bid_update.selected is not None:
        update_data[f"bids.{service_name}.selected"] = bid_update.selected
    if bid_update.estCost is not None:
        update_data[f"bids.{service_name}.estCost"] = bid_update.estCost
    if bid_update.details is not None:
        update_data[f"bids.{service_name}.details"] = bid_update.details
    if bid_update.notes is not None:
        update_data[f"bids.{service_name}.notes"] = bid_update.notes
    if bid_update.aiRecommendations is not None:
        update_data[f"bids.{service_name}.aiRecommendations"] = bid_update.aiRecommendations
    
    result = await db.projects.update_one(
        {"project_id": project_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Bid updated successfully"}


# ============== AI ENDPOINTS ==============
# TODO: MIGRATE AI TO CUSTOMER'S OWN GEMINI KEY LATER
# Currently using Emergent LLM Key (gemini-2.0-flash-lite for cost efficiency)

@app.post("/api/ai/recommendations")
async def get_ai_recommendations(
    request: AIRecommendationRequest,
    user: User = Depends(get_current_user)
):
    """Generate AI recommendations for a service."""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    prompt = f"""
You are a senior technical consultant for Longhorn Solar, an expert in residential energy efficiency in Central Texas.

The user is configuring the service: "{request.serviceName}".
The overall project currently includes: [{', '.join(request.otherSelectedServices)}].

Site conditions and specific client notes:
"{request.notes}"

Analyze the project and provide a professional brief focused on:

1. **Price & Scope Impact**: Identify specific site conditions mentioned that will likely increase or decrease the final price (e.g., roof age, narrow access, electrical panel capacity).
2. **Order of Operations**: If multiple services are selected, what is the mandatory or recommended sequence? (e.g., "Do the energy audit/sealing before the HVAC sizing").
3. **Longhorn Synergy Opportunities**: How does this service benefit from or improve the other selected offerings? If there's a logical missing piece (e.g., Solar without a Smart Thermostat), recommend it.
4. **Critical Pitfalls**: Specific Central Texas construction risks (Heat, humidity, attic accessibility).

Format the output with bold headers. Keep it professional, high-value, and concise enough for a busy project manager.
"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"ai_rec_{uuid.uuid4().hex[:8]}",
            system_message="You are an expert energy efficiency consultant for Longhorn Solar in Central Texas."
        ).with_model("gemini", "gemini-2.0-flash-lite")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        return {"recommendations": response}
    except Exception as e:
        print(f"AI Error: {e}")
        return {"recommendations": "Failed to generate recommendations. Please try again later."}


# ============== UTILITY ENDPOINTS ==============

@app.get("/api/services")
async def get_services():
    """Get all available services."""
    return SERVICES_DB


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

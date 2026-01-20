
import { ServicesDB, ProjectState, ProjectStatus, BidItem } from './types';

export const SERVICES_DB: ServicesDB = {
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
    "desc": "Heat pump or tankless water heater.",
    "details": ["Fuel Source (Gas/Electric)", "Type (Tank/Tankless)", "Capacity (Gallons/GPM)", "Location"]
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
};

const createEmptyBids = (): Record<string, BidItem> => {
  const bids: Record<string, BidItem> = {};
  Object.keys(SERVICES_DB).forEach(name => {
    bids[name] = {
      serviceName: name,
      selected: false,
      estCost: 0,
      details: {},
      notes: '',
      aiRecommendations: ''
    };
  });
  return bids;
};

export const MOCK_PROJECTS: ProjectState[] = [
  {
    id: '1',
    clientName: 'John Smith',
    projectDate: '2023-11-01',
    status: ProjectStatus.QUOTING,
    bids: {
        ...createEmptyBids(),
        "Solar": { serviceName: "Solar", selected: true, estCost: 15000, details: {}, notes: '', aiRecommendations: '' },
        "Batteries": { serviceName: "Batteries", selected: true, estCost: 12000, details: {}, notes: '', aiRecommendations: '' }
    }
  },
  {
    id: '2',
    clientName: 'Sarah Jenkins',
    projectDate: '2023-10-25',
    status: ProjectStatus.PROPOSED,
    bids: {
        ...createEmptyBids(),
        "HVAC/Heat Pump": { serviceName: "HVAC/Heat Pump", selected: true, estCost: 8500, details: {}, notes: '', aiRecommendations: '' },
        "Insulation": { serviceName: "Insulation", selected: true, estCost: 1200, details: {}, notes: '', aiRecommendations: '' }
    }
  },
  {
    id: '3',
    clientName: 'Austin Community Center',
    projectDate: '2023-09-12',
    status: ProjectStatus.IN_PROGRESS,
    bids: {
        ...createEmptyBids(),
        "Solar": { serviceName: "Solar", selected: true, estCost: 45000, details: {}, notes: '', aiRecommendations: '' }
    }
  },
  {
    id: '4',
    clientName: 'Michael Brown',
    projectDate: '2023-11-05',
    status: ProjectStatus.QUOTING,
    bids: createEmptyBids()
  }
];

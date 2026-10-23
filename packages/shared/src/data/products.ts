import { Product } from '../index';

export const INITIAL_PRODUCTS: Product[] = [
  // ==========================================
  // 1. PURIFIERS (12 Products)
  // ==========================================
  {
    id: 'purifier-aqua-grand-plus-12l',
    name: 'AquaGrand+ RO+UV+UF+TDS Controller 12L Purifier',
    category: 'purifiers',
    description: 'Multi-stage domestic water purifier with active copper enrichment, 12-liter food-grade tank, and intelligent TDS management system for high input water TDS up to 2000 ppm.',
    price: 13999,
    wholesalePrice: 8899,
    minWholesaleQty: 5,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    stock: 45,
    inStock: true,
    specifications: {
      'Filtration Stages': 'RO + UV + UF + TDS Infuser + Copper Carbon',
      'Purification Capacity': '15 L/hr',
      'Storage Tank': '12 Liters Food Grade ABS',
      'Input TDS Suitability': 'Up to 2000 mg/L',
      'Mounting': 'Wall Mount / Counter Top',
      'Warranty': '1 Year Comprehensive'
    },
    rating: 4.8,
    reviewsCount: 142,
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'purifier-alkaline-copper-touch-10l',
    name: 'HydroPure Alkaline Mineralizer & Copper Infusion 10L',
    category: 'purifiers',
    description: 'Advanced alkaline water purifier that balances pH between 8.0 and 9.5 and enriches drinking water with natural magnesium, calcium, and antibacterial copper ions.',
    price: 16499,
    wholesalePrice: 10499,
    minWholesaleQty: 4,
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    stock: 28,
    inStock: true,
    specifications: {
      'Filtration Stages': '7-Stage Alkaline RO + Biocare Mineralizer',
      'pH Range': '8.0 - 9.5 Balanced',
      'Storage Tank': '10 Liters Stainless Steel 304',
      'Purification Speed': '18 L/hr',
      'Mounting': 'Wall Mounted',
      'Warranty': '2 Years'
    },
    rating: 4.9,
    reviewsCount: 98,
    createdAt: '2026-01-18T00:00:00.000Z'
  },
  {
    id: 'purifier-under-sink-compact-ro',
    name: 'StealthPro Under-Sink RO with Lead-Free Stainless Faucet',
    category: 'purifiers',
    description: 'Concealed kitchen counter RO system with a pressurized hydro-pneumatic storage tank and brushed nickel swan-neck drinking water faucet.',
    price: 18999,
    wholesalePrice: 12500,
    minWholesaleQty: 3,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    stock: 19,
    inStock: true,
    specifications: {
      'Installation Type': 'Under-Sink Concealed',
      'Pressure Tank': '3.2 Gallon NSF Hydro-pneumatic',
      'Faucet': 'Solid Stainless Steel 304 Lead-Free',
      'Flow Rate': '20 L/hr',
      'Input TDS Max': '2500 ppm'
    },
    rating: 4.7,
    reviewsCount: 76,
    createdAt: '2026-01-20T00:00:00.000Z'
  },
  {
    id: 'purifier-commercial-50lph-plant',
    name: 'AquaPro Commercial 50 LPH Stainless Steel RO Plant',
    category: 'purifiers',
    description: 'High-volume commercial water treatment plant for offices, cafes, clinics, and small institutions. Built on a skid-mounted SS304 anti-corrosive chassis with twin 3012 RO membranes.',
    price: 34500,
    wholesalePrice: 24200,
    minWholesaleQty: 2,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 12,
    inStock: true,
    specifications: {
      'Purification Output': '50 Litres / Hour',
      'Membranes': '2x 3012-300 GPD Industrial',
      'High Pressure Pump': 'Rotary Vane / 300 GPD Booster',
      'Frame': 'SS 304 Polished Skid',
      'Power Supply': '230V AC 50Hz'
    },
    rating: 4.9,
    reviewsCount: 45,
    createdAt: '2026-01-22T00:00:00.000Z'
  },
  {
    id: 'purifier-commercial-100lph-dual-pump',
    name: 'MegaPure Industrial 100 LPH RO Skid with Sand Filter',
    category: 'purifiers',
    description: 'Heavy-duty 100 LPH multi-media filtration system equipped with automated backwash control, twin brass booster pumps, and digital pressure monitoring gauge.',
    price: 58000,
    wholesalePrice: 41500,
    minWholesaleQty: 1,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 6,
    inStock: true,
    specifications: {
      'Capacity': '100 LPH Continuous Duty',
      'Pre-Treatment': 'FRP Vessel with Multiport Valve',
      'Membranes': '4x 4040 Commercial RO Elements',
      'Operating Pressure': '150 - 200 PSI',
      'Automation': 'Low & High Pressure Auto Trip'
    },
    rating: 5.0,
    reviewsCount: 18,
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'purifier-crystal-uv-wall-mount',
    name: 'CrystalClear High-Flow UV + UF Inline Purifier 8L',
    category: 'purifiers',
    description: 'Designed specifically for low TDS municipal water (TDS < 200). Retains natural essential minerals while eliminating 99.99% of bacteria and viruses via stainless steel UV chamber.',
    price: 8499,
    wholesalePrice: 5699,
    minWholesaleQty: 5,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
    stock: 35,
    inStock: true,
    specifications: {
      'Water Source': 'Municipal / River Water (TDS < 250)',
      'UV Chamber': 'High-Intensity 11W Philips UV in SS316',
      'UF Hollow Fiber': '0.01 Micron',
      'Storage Tank': '8 Liters Detachable',
      'No Water Wastage': '100% Recovery Efficiency'
    },
    rating: 4.6,
    reviewsCount: 110,
    createdAt: '2026-02-05T00:00:00.000Z'
  },
  {
    id: 'purifier-gravity-non-electric-20l',
    name: 'PureDrop Gravity UF Non-Electric Disaster Water Purifier 20L',
    category: 'purifiers',
    description: 'Zero-electricity gravity water filtration system with upper raw water chamber and lower purified reservoir. Essential for rural setups and backup emergency storage.',
    price: 3299,
    wholesalePrice: 2199,
    minWholesaleQty: 10,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    stock: 50,
    inStock: true,
    specifications: {
      'Operation': 'Non-Electric / Gravity Driven',
      'Cartridge Type': 'Ultrafiltration 0.01 Micron + Carbon Felt',
      'Total Volume': '20 Liters (9L Raw + 11L Purified)',
      'Maintenance': 'Washable UF membrane'
    },
    rating: 4.5,
    reviewsCount: 88,
    createdAt: '2026-02-10T00:00:00.000Z'
  },
  {
    id: 'purifier-hot-cold-ambient-ro',
    name: 'ThermaPure 3-in-1 Instant Hot, Cold & Ambient RO Station',
    category: 'purifiers',
    description: 'All-in-one kitchen countertop appliance providing instant 90°C hot water for tea/coffee, 8°C chilled water, and room temperature mineralized water with child-lock protection.',
    price: 24999,
    wholesalePrice: 17200,
    minWholesaleQty: 3,
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    stock: 14,
    inStock: true,
    specifications: {
      'Hot Water Capacity': '1.5 L/hr @ 90°C',
      'Cold Water Capacity': '2.5 L/hr @ 8°C (Compressor Chilling)',
      'Normal Storage': '6.0 Liters',
      'Heating Power': '500 Watts (Rapid Thermal Core)',
      'Safety': 'Dual Child Safety Thermal Cut-off'
    },
    rating: 4.8,
    reviewsCount: 52,
    createdAt: '2026-02-14T00:00:00.000Z'
  },
  {
    id: 'purifier-smart-iot-wifi-ro',
    name: 'IntelliSense IoT Smart RO with Real-time TDS Display',
    category: 'purifiers',
    description: 'Smart Wi-Fi enabled domestic purifier with digital LED front panel showing live input and output TDS, filter replacement countdown, and auto service alert buzzer.',
    price: 17999,
    wholesalePrice: 11900,
    minWholesaleQty: 4,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    stock: 22,
    inStock: true,
    specifications: {
      'Display': 'Digital Micro-OLED Dashboard',
      'Connectivity': 'Bluetooth 5.2 & 2.4GHz Wi-Fi',
      'Sensors': 'Inlet TDS, Outlet TDS, Flow Meter, Leak Detection',
      'Tank Size': '9.5 Liters Sealed Tank',
      'Auto-Flush': 'Intelligent RO Membrane Auto-clean Cycle'
    },
    rating: 4.7,
    reviewsCount: 64,
    createdAt: '2026-02-18T00:00:00.000Z'
  },
  {
    id: 'purifier-compact-apartment-slim-ro',
    name: 'SlimLine Ultra-Compact Wall-Mount RO Purifier 7L',
    category: 'purifiers',
    description: 'Space-saving 18cm ultra-thin profile water purifier specially engineered for compact urban studio apartments and modular kitchen backsplashes.',
    price: 11499,
    wholesalePrice: 7750,
    minWholesaleQty: 6,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    stock: 30,
    inStock: true,
    specifications: {
      'Depth': 'Only 18 cm Slim Profile',
      'Storage Volume': '7 Liters High-Gloss Tank',
      'Stages': 'Sediment + Carbon + RO 75 GPD + Mineral Post Carbon',
      'Auto Shut-Off': 'High-pressure sensor switch'
    },
    rating: 4.6,
    reviewsCount: 93,
    createdAt: '2026-02-22T00:00:00.000Z'
  },
  {
    id: 'purifier-direct-flow-tankless-ro',
    name: 'Tankless Direct-Flow 600 GPD Fresh Water RO System',
    category: 'purifiers',
    description: 'Eliminates stagnant water tanks completely! Produces fresh purified water directly on demand at a rapid 1.6 Liters per minute with zero water re-contamination.',
    price: 28999,
    wholesalePrice: 19800,
    minWholesaleQty: 2,
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    stock: 8,
    inStock: true,
    specifications: {
      'Flow Rate': '600 GPD (1.6 L/min instantaneous)',
      'Pure-to-Drain Ratio': '2:1 High Efficiency Water Saver',
      'Membrane': 'Custom Dual-Port 600 GPD TFC Membrane',
      'Chassis': 'Vibration Dampened Soundproof Casing'
    },
    rating: 4.9,
    reviewsCount: 39,
    createdAt: '2026-02-28T00:00:00.000Z'
  },
  {
    id: 'purifier-ro-iron-remover-heavy-duty',
    name: 'IronGuard Borewell RO + Manganese Sand Pre-Filter 12L',
    category: 'purifiers',
    description: 'Customized for deep borewells suffering from heavy red-rust iron contamination and dissolved hard scale. Includes dual stage external manganese iron remover.',
    price: 17299,
    wholesalePrice: 11500,
    minWholesaleQty: 4,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    stock: 0, // Testing out-of-stock badge
    inStock: false,
    specifications: {
      'Iron Removal': 'Up to 5.0 mg/L Ferrous/Ferric Iron',
      'Hardness Handling': 'Up to 900 ppm with Anti-Scalant Ball Filter',
      'Storage Tank': '12 Liters Sealed ABS',
      'Inlet Pressure Needed': '10 to 40 PSI'
    },
    rating: 4.7,
    reviewsCount: 47,
    createdAt: '2026-03-01T00:00:00.000Z'
  },

  // ==========================================
  // 2. DISPENSERS (10 Products)
  // ==========================================
  {
    id: 'dispenser-floor-standing-hot-cold',
    name: 'HydroChill Floor-Standing Hot, Normal & Cold Water Dispenser',
    category: 'dispensers',
    description: 'Commercial grade floor dispenser with quiet R134a compressor cooling, durable push taps, and spacious 16-liter bottom refrigerated storage cabinet.',
    price: 12499,
    wholesalePrice: 8600,
    minWholesaleQty: 3,
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    stock: 24,
    inStock: true,
    specifications: {
      'Cooling Capacity': '3.0 L/hr @ ≤10°C',
      'Heating Capacity': '5.0 L/hr @ ≥90°C',
      'Refrigerant': 'R134a Eco-friendly CFC Free',
      'Cabinet': '16L Lower Chilling Storage',
      'Body': 'Anti-rust Painted CRCA Steel'
    },
    rating: 4.7,
    reviewsCount: 83,
    createdAt: '2026-01-16T00:00:00.000Z'
  },
  {
    id: 'dispenser-bottom-load-ergonomic',
    name: 'EasyLift Bottom-Loading Water Dispenser with LED Indicator',
    category: 'dispensers',
    description: 'No more heavy lifting! Easily slide standard 20-liter water bottles into the bottom door compartment. Concealed pump mechanism delivers chilled or steaming water effortlessly.',
    price: 15999,
    wholesalePrice: 10800,
    minWholesaleQty: 2,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    stock: 18,
    inStock: true,
    specifications: {
      'Bottle Loading': 'Bottom Concealed Door Compartment',
      'Pump System': 'Submersible Heavy-Duty Suction Straw',
      'Child Lock': 'Mechanical Safety Shield on Hot Tap',
      'Cold Reservoir': '3.2L Food Grade SS304',
      'Hot Reservoir': '1.2L Insulated Stainless Tank'
    },
    rating: 4.8,
    reviewsCount: 92,
    createdAt: '2026-01-25T00:00:00.000Z'
  },
  {
    id: 'dispenser-tabletop-compact-office',
    name: 'AquaMini Tabletop Hot & Cold Dispenser for Executive Desks',
    category: 'dispensers',
    description: 'Compact desktop water chiller dispenser ideal for conference rooms, reception desks, and private cabins. Features silent electronic Peltier thermoelectric cooling.',
    price: 7899,
    wholesalePrice: 5399,
    minWholesaleQty: 5,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    stock: 32,
    inStock: true,
    specifications: {
      'Cooling Type': 'Silent Semiconductor Peltier Tech',
      'Cold Temp': '12°C - 15°C',
      'Hot Temp': '85°C - 92°C',
      'Dimensions': '31 x 31 x 42 cm',
      'Bottle Size Compatibility': 'Standard 10L, 15L & 20L Cans'
    },
    rating: 4.5,
    reviewsCount: 67,
    createdAt: '2026-02-02T00:00:00.000Z'
  },
  {
    id: 'dispenser-commercial-ss-3tap-60l',
    name: 'SteelMaster Commercial 60L Water Cooler with 3 Brass Taps',
    category: 'dispensers',
    description: 'All-stainless-steel heavy industrial water cooler designed for schools, factories, and religious institutions. High-speed copper coil chiller drops water temperature in 15 minutes.',
    price: 36999,
    wholesalePrice: 26500,
    minWholesaleQty: 1,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 9,
    inStock: true,
    specifications: {
      'Tank Storage': '60 Litres SS 304 Buffed',
      'Cooling Output': '40 Litres / Hour Continuous',
      'Taps': '3x Chrome Plated Solid Brass Push Taps',
      'Compressor': 'Tecumseh / Emerson High-Ambient Rated',
      'Drain Basin': 'Deep anti-splash stainless drain trough'
    },
    rating: 4.9,
    reviewsCount: 29,
    createdAt: '2026-02-06T00:00:00.000Z'
  },
  {
    id: 'dispenser-touchless-sensor-hygiene',
    name: 'SafeTouch Infrared Sensor Automatic Hands-Free Dispenser',
    category: 'dispensers',
    description: 'Zero contact infrared optical sensor water dispenser. Automatically dispenses measured 250ml glasses or continuous stream by waving hand over proximity sensors.',
    price: 19499,
    wholesalePrice: 13900,
    minWholesaleQty: 2,
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    stock: 15,
    inStock: true,
    specifications: {
      'Dispensing': 'Dual IR Optical Proximity Sensors',
      'Response Time': '< 0.2 seconds',
      'Hot / Cold Selection': 'Soft-touch capacitive selector',
      'UV Sterilization': 'Continuous in-tank UV-C LED diode',
      'Cabinet': 'Polycarbonate Scratch Resistant'
    },
    rating: 4.9,
    reviewsCount: 38,
    createdAt: '2026-02-12T00:00:00.000Z'
  },
  {
    id: 'dispenser-direct-inline-plumbed-ro',
    name: 'AquaStation Point-of-Use Direct Plumbed Bottleless Dispenser',
    category: 'dispensers',
    description: 'Plumbs directly into municipal water inlet with internal 4-stage RO filtration cartridge system. Never order or lift 20L plastic bottles again.',
    price: 21999,
    wholesalePrice: 15200,
    minWholesaleQty: 2,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    stock: 11,
    inStock: true,
    specifications: {
      'Feed': 'Direct 1/4" Pressure Tubing from Main Supply',
      'Internal Filtration': 'Quick-Change Sediment, Carbon, RO 75G, Post Carbon',
      'Hot / Cold / Ambient': '3 Independent Storage Reservoirs',
      'Leak Detector': 'Automatic mechanical shut-off safety float'
    },
    rating: 4.8,
    reviewsCount: 41,
    createdAt: '2026-02-15T00:00:00.000Z'
  },
  {
    id: 'dispenser-soda-sparkling-water',
    name: 'SparklePro Sparkling & Cold Water Craft Dispenser',
    category: 'dispensers',
    description: 'Features integrated CO2 canister bay to dispense sparkling fizzy water, ice-cold still water, and ambient filtered water at the touch of a button.',
    price: 32999,
    wholesalePrice: 22800,
    minWholesaleQty: 2,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    stock: 5,
    inStock: true,
    specifications: {
      'Carbonation Level': 'Adjustable 3-stage carbonator pressure',
      'CO2 Tank Compatibility': 'Standard 60L screw-in aluminum cylinders',
      'Cooling System': 'Direct-chill aluminum block exchanger',
      'Housing': 'Brushed Gunmetal Titanium finish'
    },
    rating: 4.9,
    reviewsCount: 19,
    createdAt: '2026-02-20T00:00:00.000Z'
  },
  {
    id: 'dispenser-industrial-ss-120l-dual-tap',
    name: 'MaxiCool Industrial 120L Water Chiller Plant with Dual Faucets',
    category: 'dispensers',
    description: 'Heavy architectural water drinking fountain for construction sites, logistics warehouses, and transport hubs. Double insulated stainless body keeps water cold for 12 hours during power outages.',
    price: 49500,
    wholesalePrice: 35000,
    minWholesaleQty: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 7,
    inStock: true,
    specifications: {
      'Gross Storage': '120 Litres Stainless Tank',
      'Continuous Cooling': '80 Litres / Hour capacity',
      'Insulation': 'High Density PUF 45mm Wall Injection',
      'Safety': 'In-built Voltage Stabilizer Protection Circuit'
    },
    rating: 4.8,
    reviewsCount: 22,
    createdAt: '2026-02-25T00:00:00.000Z'
  },
  {
    id: 'dispenser-manual-hand-press-pump',
    name: 'HydroPress Manual Bottle Top Hand Action Water Pump',
    category: 'dispensers',
    description: 'Food grade BPA-free mechanical piston pump that clamps tightly onto 20-liter water jugs. No battery, electricity, or maintenance required.',
    price: 499,
    wholesalePrice: 240,
    minWholesaleQty: 20,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    stock: 140,
    inStock: true,
    specifications: {
      'Operation': 'Manual Vacuum Piston Action',
      'Dispense Rate': 'Up to 3.5 Litres / min',
      'Fitment': 'Standard 55mm crown top neck',
      'Material': '100% Virgin Virgin Food Grade Polypropylene'
    },
    rating: 4.4,
    reviewsCount: 230,
    createdAt: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'dispenser-rechargeable-usb-automatic-pump',
    name: 'SmartFlow USB-C Rechargeable Electric Can Water Dispenser',
    category: 'dispensers',
    description: 'Wireless automatic drinking water pump with 1800mAh rechargeable lithium battery, silicone food-grade suction hose, and quick one-touch dispensing.',
    price: 999,
    wholesalePrice: 480,
    minWholesaleQty: 15,
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    stock: 65,
    inStock: true,
    specifications: {
      'Battery': '1800mAh Li-ion (Pumps up to 8 full 20L bottles per charge)',
      'Charging Port': 'USB Type-C Fast Charge (5V/1A)',
      'Noise': '< 45 dB whisper quiet motor',
      'Spout': 'SS304 Foldable Hygienic Spout'
    },
    rating: 4.6,
    reviewsCount: 310,
    createdAt: '2026-03-05T00:00:00.000Z'
  },

  // ==========================================
  // 3. PUMPS (10 Products)
  // ==========================================
  {
    id: 'pump-booster-75gpd-24vdc',
    name: 'VoltForce 75 GPD Domestic RO Booster Pump (24V DC)',
    category: 'pumps',
    description: 'High-torque copper wound booster pump designed to supply constant 80 PSI pressure across domestic RO membranes, ensuring maximum water purification yield and reduced drain waste.',
    price: 1850,
    wholesalePrice: 1190,
    minWholesaleQty: 10,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 85,
    inStock: true,
    specifications: {
      'Rated Capacity': '75 Gallons Per Day (GPD)',
      'Operating Voltage': '24V DC / 1.2 Amps',
      'Operating Pressure': '80 - 100 PSI',
      'Suction Height': 'Up to 2 meters self-priming',
      'Motor Winding': '100% Grade A Electrolytic Copper',
      'Inlet / Outlet': '3/8" NPT Female Threaded'
    },
    rating: 4.8,
    reviewsCount: 165,
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'pump-booster-100gpd-high-pressure',
    name: 'HeavyDuty 100 GPD RO Booster Pump 24V (130 PSI Peak)',
    category: 'pumps',
    description: 'High-performance booster pump engineered for low-pressure municipal pipe networks and deep multi-stage alkaline filtration setups requiring elevated flow velocity.',
    price: 2250,
    wholesalePrice: 1420,
    minWholesaleQty: 8,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 54,
    inStock: true,
    specifications: {
      'Membrane Rating': 'Up to 100 / 125 GPD RO Membranes',
      'Peak Pressure': '130 PSI',
      'Power Spec': '24V DC, 1.8A current draw',
      'Diaphragm': 'Santoprene chemical resistant elastomer',
      'Vibration': 'Anti-vibration rubber mounting bracket included'
    },
    rating: 4.9,
    reviewsCount: 122,
    createdAt: '2026-01-18T00:00:00.000Z'
  },
  {
    id: 'pump-commercial-150gpd-36vdc',
    name: 'TorqueMax 150 GPD Commercial Booster Pump (36V DC)',
    category: 'pumps',
    description: 'High-displacement 36V booster pump for 25 LPH to 40 LPH commercial water purifiers in restaurants and cafes. Low heat dissipation with continuous duty cycle.',
    price: 3400,
    wholesalePrice: 2250,
    minWholesaleQty: 5,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 36,
    inStock: true,
    specifications: {
      'Voltage': '36V DC / 2.0A',
      'Max Pressure': '140 PSI',
      'Flow Rate': '2.2 Liters per minute open flow',
      'Bearings': 'Double sealed Japanese ball bearings'
    },
    rating: 4.8,
    reviewsCount: 54,
    createdAt: '2026-01-28T00:00:00.000Z'
  },
  {
    id: 'pump-industrial-300gpd-48vdc',
    name: 'Industrial 300 GPD Ultra-Flow Booster Pump (48V DC)',
    category: 'pumps',
    description: 'Heavy industrial diaphragm pump for 50 LPH commercial RO systems. Delivers sustained high-pressure water delivery across multiple 3012 industrial membranes.',
    price: 5200,
    wholesalePrice: 3550,
    minWholesaleQty: 4,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 19,
    inStock: true,
    specifications: {
      'Capacity': '300 GPD Output',
      'Voltage': '48V DC / 3.0A',
      'Displacement': '3.8 L/min @ 100 PSI',
      'Housing': 'Cast alloy head with corrosion-proof coating'
    },
    rating: 4.9,
    reviewsCount: 31,
    createdAt: '2026-02-04T00:00:00.000Z'
  },
  {
    id: 'pump-self-priming-suction-24v',
    name: 'Self-Priming Suction RO Pump for Zero-Pressure Overhead Tanks',
    category: 'pumps',
    description: 'Equipped with an oversized eccentric cam and suction valving that pulls raw water from zero-pressure or below-level buckets and underground cisterns without requiring gravity head.',
    price: 2450,
    wholesalePrice: 1590,
    minWholesaleQty: 8,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 42,
    inStock: true,
    specifications: {
      'Suction Lift': 'Self-priming up to 3 meters negative lift',
      'Voltage': '24V DC / 1.5A',
      'Discharge Pressure': '110 PSI',
      'Thermal Protection': 'Internal auto-reset thermal fuse'
    },
    rating: 4.7,
    reviewsCount: 79,
    createdAt: '2026-02-09T00:00:00.000Z'
  },
  {
    id: 'pump-high-pressure-rotary-vane-brass',
    name: 'Fluid-o-Tech Style Brass Rotary Vane High Pressure Pump',
    category: 'pumps',
    description: 'Precision positive displacement rotary brass pump for 100 LPH to 250 LPH commercial water plants and espresso water treatment stations.',
    price: 8900,
    wholesalePrice: 6200,
    minWholesaleQty: 2,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 8,
    inStock: true,
    specifications: {
      'Body Material': 'Forged Brass (NSF 61 compliant)',
      'Flow Rate': '200 to 400 LPH adjustable',
      'Working Pressure': '14 Bar (200 PSI)',
      'Drive Connection': 'Clamp band coupling to electric motor'
    },
    rating: 5.0,
    reviewsCount: 15,
    createdAt: '2026-02-14T00:00:00.000Z'
  },
  {
    id: 'pump-mini-misting-cooling-24v',
    name: 'AquaMist High-Pressure Outdoor Misting & Garden Pump 24V',
    category: 'pumps',
    description: 'Dual-purpose high-pressure booster pump capable of firing water purifier systems or up to 20 outdoor cooling mist nozzles for patio heat control.',
    price: 1999,
    wholesalePrice: 1299,
    minWholesaleQty: 6,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 25,
    inStock: true,
    specifications: {
      'Working Pressure': '120 PSI',
      'Flow Rate': '1.0 LPM',
      'Fittings': '1/4" push-fit elbows included',
      'Duty Cycle': 'Continuous intermittent'
    },
    rating: 4.5,
    reviewsCount: 46,
    createdAt: '2026-02-19T00:00:00.000Z'
  },
  {
    id: 'pump-head-replacement-assembly',
    name: 'Universal 75/100 GPD Booster Pump Head Replacement Assembly',
    category: 'pumps',
    description: 'Save money by replacing just the damaged diaphragm or leaking valve head without repurchasing the entire electric motor assembly. Fits 95% of domestic brands.',
    price: 650,
    wholesalePrice: 390,
    minWholesaleQty: 15,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 70,
    inStock: true,
    specifications: {
      'Compatibility': 'Universal 3-screw and 4-screw flange pattern',
      'Includes': 'Santoprene diaphragm, steel drive cam, front check-valves',
      'Max Pressure Rating': '140 PSI'
    },
    rating: 4.6,
    reviewsCount: 88,
    createdAt: '2026-02-23T00:00:00.000Z'
  },
  {
    id: 'pump-stainless-vertical-multistage-ro',
    name: 'HydroForce SS316 Vertical Multistage High Pressure RO Pump',
    category: 'pumps',
    description: 'Commercial 3-phase vertical multistage centrifugal stainless pump for 500 LPH to 1000 LPH industrial reverse osmosis desalinators.',
    price: 28500,
    wholesalePrice: 20500,
    minWholesaleQty: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 4,
    inStock: true,
    specifications: {
      'Motor': '1.5 HP 415V Three Phase 50Hz',
      'Impellers': 'Laser welded AISI 316 Stainless Steel',
      'Head Range': '80 to 140 meters head',
      'Flanges': 'Standard DIN PN25 cast connection'
    },
    rating: 4.9,
    reviewsCount: 11,
    createdAt: '2026-02-27T00:00:00.000Z'
  },
  {
    id: 'pump-dc-mini-submersible-cooler',
    name: 'EcoFlow 12V DC Low-Voltage Submersible Water Circulation Pump',
    category: 'pumps',
    description: 'Brushless magnetic drive mini submersible water pump for ice water baths, hydroponics reservoirs, and water cooler tank recirculation.',
    price: 750,
    wholesalePrice: 420,
    minWholesaleQty: 15,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 60,
    inStock: true,
    specifications: {
      'Power': '12V DC / 6 Watts',
      'Submersible Depth': 'Up to 1.5 meters IP68 waterproof',
      'Flow Rate': '280 Liters / Hour',
      'Shaft': 'Zirconia ceramic wear-proof shaft'
    },
    rating: 4.6,
    reviewsCount: 104,
    createdAt: '2026-03-02T00:00:00.000Z'
  },

  // ==========================================
  // 4. FILTERS (10 Products)
  // ==========================================
  {
    id: 'filter-sediment-spun-5micron-10inch',
    name: 'PureShield 5-Micron 10-Inch Spun Polypropylene Sediment Filter',
    category: 'filters',
    description: 'First line of defense against sand, silt, rust particles, and suspended solids. 100% pure melt-blown food-grade polypropylene with true multi-layer depth filtration.',
    price: 249,
    wholesalePrice: 75,
    minWholesaleQty: 50,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    stock: 250,
    inStock: true,
    specifications: {
      'Micron Rating': '5 Micron nominal',
      'Length': '10 Inch standard (Fits all universal pre-filter housings)',
      'Weight': '110 grams high density weave',
      'Lifespan': '3 to 6 months depending on water turbidity'
    },
    rating: 4.8,
    reviewsCount: 340,
    createdAt: '2026-01-08T00:00:00.000Z'
  },
  {
    id: 'filter-carbon-block-cto-10inch',
    name: 'CarboMax 10-Inch Extruded Activated Carbon Block (CTO)',
    category: 'filters',
    description: 'Made from high iodine (1100 IV) virgin coconut shell carbon. Absorbs up to 99% of free chlorine, organic pesticides, unpleasant smells, and chemical turbidity.',
    price: 399,
    wholesalePrice: 165,
    minWholesaleQty: 30,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
    stock: 180,
    inStock: true,
    specifications: {
      'Carbon Source': 'High-Adsorption Coconut Shell Carbon',
      'Iodine Value': '1100 mg/g',
      'Chlorine Reduction': '> 98% efficiency',
      'Pressure Drop': '< 0.2 bar at 2 L/min flow'
    },
    rating: 4.7,
    reviewsCount: 215,
    createdAt: '2026-01-12T00:00:00.000Z'
  },
  {
    id: 'filter-membrane-ro-75gpd-tfc',
    name: 'Dow-FilmTec Grade 75 GPD Thin Film Composite (TFC) RO Membrane',
    category: 'filters',
    description: 'The core heart of reverse osmosis. Features ultra-fine 0.0001-micron pores that reject up to 97% of heavy metals, lead, arsenic, fluoride, and dissolved mineral salts.',
    price: 1899,
    wholesalePrice: 950,
    minWholesaleQty: 10,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    stock: 95,
    inStock: true,
    specifications: {
      'Capacity': '75 Gallons Per Day (approx. 12-15 L/hr)',
      'Salt Rejection Rate': '96% - 98% stabilized',
      'Pore Size': '0.0001 Micron',
      'Max Input TDS': '2500 ppm',
      'Testing Pressure': '65 PSI'
    },
    rating: 4.9,
    reviewsCount: 280,
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'filter-membrane-ro-100gpd-high-tds',
    name: 'ApexTech 100 GPD Heavy-TDS TFC RO Membrane Element',
    category: 'filters',
    description: 'Engineered specifically for harsh groundwater with high mineral hardness and dissolved solids up to 3500 ppm. Resists premature scaling with wide spacer mesh.',
    price: 2299,
    wholesalePrice: 1250,
    minWholesaleQty: 8,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    stock: 62,
    inStock: true,
    specifications: {
      'Capacity': '100 Gallons Per Day (16-18 L/hr)',
      'Max Water TDS': 'Up to 3500 ppm input',
      'Recovery': 'Up to 35% with proper flow restrictor',
      'Lifespan': '18 to 24 months typical'
    },
    rating: 4.8,
    reviewsCount: 160,
    createdAt: '2026-01-22T00:00:00.000Z'
  },
  {
    id: 'filter-alkaline-mineral-cartridge-post-ro',
    name: 'BioAlkaline Remineralization Cartridge with Anti-Oxidant Balls',
    category: 'filters',
    description: 'Post-RO polishing filter that restores vital minerals stripped away by reverse osmosis. Adds essential Magnesium, Calcium, Potassium, and elevates pH to healthy 8.5.',
    price: 899,
    wholesalePrice: 380,
    minWholesaleQty: 15,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    stock: 110,
    inStock: true,
    specifications: {
      'Mineral Enriched': 'Ca2+, Mg2+, K+, Na+ ions',
      'ORP Reduction': 'Negative ORP (-100mV to -250mV antioxidant potential)',
      'pH Balance': 'Increases acidic RO water to alkaline 8.0 - 9.0',
      'Cartridge Length': 'Standard 10 Inch Inline with 1/4" female threaded ports'
    },
    rating: 4.9,
    reviewsCount: 195,
    createdAt: '2026-01-30T00:00:00.000Z'
  },
  {
    id: 'filter-copper-zinc-bacteriostatic-inline',
    name: 'CopperGold Active Copper & Zinc Micro-Nutrient Inline Filter',
    category: 'filters',
    description: 'Bacteriostatic copper and zinc granular media that naturally disinfects stored water, destroys harmful bacterial cell walls, and supports immune health.',
    price: 999,
    wholesalePrice: 450,
    minWholesaleQty: 12,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
    stock: 75,
    inStock: true,
    specifications: {
      'Media Composition': '99.9% Pure Copper Granules + KDF-55 Media',
      'Antimicrobial Action': 'Inhibits bacterial biofilm growth in tank',
      'Taste Profile': 'Crisp, sweet traditional copper-vessel taste',
      'Capacity': '6000 Litres or 1 Year usage'
    },
    rating: 4.8,
    reviewsCount: 140,
    createdAt: '2026-02-05T00:00:00.000Z'
  },
  {
    id: 'filter-post-carbon-taste-enhancer-inline',
    name: 'UltraTaste Silver-Impregnated Post Carbon Inline Cartridge',
    category: 'filters',
    description: 'Final polishing filter placed after the water storage tank. Removes any lingering stale odors and imparts a crisp, refreshing, natural sweet spring water taste.',
    price: 499,
    wholesalePrice: 190,
    minWholesaleQty: 25,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    stock: 130,
    inStock: true,
    specifications: {
      'Carbon': 'Acid-washed silver-impregnated coconut carbon',
      'Ports': '1/4" Push-Fit Quick Connect sockets',
      'Max Pressure': '125 PSI',
      'Service Life': '1 Year'
    },
    rating: 4.7,
    reviewsCount: 185,
    createdAt: '2026-02-11T00:00:00.000Z'
  },
  {
    id: 'filter-uf-ultrafiltration-hollow-fiber',
    name: 'CleanBarrier 0.01 Micron Hollow Fiber UF Inline Membrane',
    category: 'filters',
    description: 'Traps all suspended cysts, giardia, bacteria, and microscopic microplastics without discarding any water to the drain. Operates under low natural gravity pressure.',
    price: 649,
    wholesalePrice: 280,
    minWholesaleQty: 20,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    stock: 80,
    inStock: true,
    specifications: {
      'Membrane Pore': '0.01 Micron Ultrafiltration Fiber',
      'Water Recovery': '100% Zero Water Wastage',
      'Flushability': 'Forward flush drain port for self-cleaning',
      'Housing': 'Sealed transparent acrylic viewing body'
    },
    rating: 4.6,
    reviewsCount: 97,
    createdAt: '2026-02-16T00:00:00.000Z'
  },
  {
    id: 'filter-uv-lamp-11w-philips-quartz',
    name: 'Philips 11W UV Sterilization Lamp with Quartz Sleeve & Ballast Kit',
    category: 'filters',
    description: 'Complete ultraviolet disinfection kit containing an authentic 11W germicidal Philips 4-pin UV lamp, high-purity quartz protective tube, and 24V electronic inverter ballast.',
    price: 1350,
    wholesalePrice: 720,
    minWholesaleQty: 10,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
    stock: 45,
    inStock: true,
    specifications: {
      'UV Tube': 'Philips TUV 11W 4-Pin Single Ended',
      'Wavelength': '253.7 nm Germicidal Peak (UV-C)',
      'Sleeve': 'High-transmittance 99% fused silica quartz',
      'Ballast': 'Electronic inverter with lamp failure audio alarm'
    },
    rating: 4.8,
    reviewsCount: 112,
    createdAt: '2026-02-21T00:00:00.000Z'
  },
  {
    id: 'filter-anti-scalant-polyphosphate-balls',
    name: 'ScaleStop Anti-Scalant Siliphos Polyphosphate Cartridge 10-Inch',
    category: 'filters',
    description: 'Prevents hard calcium and magnesium carbonate scale crystallization on expensive RO membranes and boiler heating elements, tripling membrane service lifespan.',
    price: 599,
    wholesalePrice: 260,
    minWholesaleQty: 20,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    stock: 90,
    inStock: true,
    specifications: {
      'Active Ingredients': 'Slow-dissolving glassy food grade polyphosphate balls',
      'Corrosion Inhibitor': 'Forms protective micro-layer on metal pipework',
      'Refillable': 'Clear housing with unscrewable top cap'
    },
    rating: 4.7,
    reviewsCount: 84,
    createdAt: '2026-02-26T00:00:00.000Z'
  },

  // ==========================================
  // 5. SPARES (10 Products)
  // ==========================================
  {
    id: 'spare-solenoid-valve-24v-slx',
    name: 'Precision 24V DC Push-Fit Magnetic Water Solenoid Valve (SV)',
    category: 'spares',
    description: 'Electric shut-off valve that automatically cuts off raw water flow when the storage tank is full or power is interrupted, preventing continuous drain water overflow.',
    price: 450,
    wholesalePrice: 195,
    minWholesaleQty: 25,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 160,
    inStock: true,
    specifications: {
      'Voltage': '24V DC / 4.8W',
      'Pressure Range': '0 to 120 PSI',
      'Port Connections': '1/4" Quick Connect push-fit sockets',
      'Coil': 'Class H insulated high temperature copper coil',
      'Life Expectancy': '> 100,000 cycles'
    },
    rating: 4.8,
    reviewsCount: 210,
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    id: 'spare-smps-power-adapter-24v-2.5a',
    name: 'Universal 24V / 2.5A Heavy-Duty SMPS Power Supply Adapter',
    category: 'spares',
    description: 'Stabilized switched-mode power supply converting AC 140V-300V to steady 24V DC. Built-in surge suppressors protect RO pumps and solenoid valves from voltage spikes.',
    price: 850,
    wholesalePrice: 420,
    minWholesaleQty: 15,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 120,
    inStock: true,
    specifications: {
      'Input Voltage Range': '140V to 300V AC 50/60Hz',
      'Output Voltage': '24V DC regulated (+/- 2%)',
      'Max Output Current': '2.5 Amps continuous',
      'Protections': 'Over-current, Over-voltage, Short Circuit with auto restart'
    },
    rating: 4.9,
    reviewsCount: 175,
    createdAt: '2026-01-11T00:00:00.000Z'
  },
  {
    id: 'spare-flow-restrictor-fr450',
    name: 'Flow Restrictor FR-450 Quick-Connect Drain Restrictor Valve',
    category: 'spares',
    description: 'Creates essential backpressure inside the RO membrane housing to force water through the microscopic pores. Calibrated specifically for 75 GPD and 80 GPD membranes.',
    price: 150,
    wholesalePrice: 45,
    minWholesaleQty: 50,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 300,
    inStock: true,
    specifications: {
      'Flow Rating': '450 mL/min calibrated resistance',
      'Fittings': '1/4" Push-Fit both ends',
      'Membrane Match': '75 GPD / 80 GPD RO elements',
      'Material': 'POM engineering thermoplastic'
    },
    rating: 4.7,
    reviewsCount: 310,
    createdAt: '2026-01-14T00:00:00.000Z'
  },
  {
    id: 'spare-high-pressure-switch-hps',
    name: 'Automatic High Pressure Cut-Off Switch (HPS) 1/4" Push-Fit',
    category: 'spares',
    description: 'Monitors line pressure between the RO membrane and the storage tank. Instantly cuts electrical power to the booster pump when the tank reaches full capacity.',
    price: 280,
    wholesalePrice: 110,
    minWholesaleQty: 30,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 140,
    inStock: true,
    specifications: {
      'Cut-Off Pressure': '35 - 40 PSI',
      'Reset Pressure': '18 - 22 PSI',
      'Electrical Rating': '5A @ 250V AC / 10A @ 24V DC',
      'Connector': 'Two spade microswitch terminals'
    },
    rating: 4.8,
    reviewsCount: 160,
    createdAt: '2026-01-19T00:00:00.000Z'
  },
  {
    id: 'spare-low-pressure-switch-lps',
    name: 'Dry-Run Protection Low Pressure Switch (LPS) 1/4" Socket',
    category: 'spares',
    description: 'Cuts electrical power immediately if raw tap water supply ceases or pre-filters become clogged, preventing booster pump burn-out from continuous dry rotation.',
    price: 260,
    wholesalePrice: 95,
    minWholesaleQty: 30,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 155,
    inStock: true,
    specifications: {
      'Trip Threshold': 'Falls below 4 PSI (0.28 bar)',
      'Electrical Contacts': 'Single Pole Single Throw (SPST) Normally Open',
      'Ports': '1/4" Quick-Connect'
    },
    rating: 4.7,
    reviewsCount: 135,
    createdAt: '2026-01-26T00:00:00.000Z'
  },
  {
    id: 'spare-tank-float-valve-mechanical',
    name: 'Heavy-Duty Magnetic Tank Float Valve Switch with Microswitch',
    category: 'spares',
    description: 'Hermetically sealed magnetic reed float sensor that mounts inside the purified water storage chamber. Dual-action ensures zero leak risk.',
    price: 320,
    wholesalePrice: 140,
    minWholesaleQty: 25,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 95,
    inStock: true,
    specifications: {
      'Mounting': 'Through-hole horizontal or top vertical tank mount',
      'Float Material': 'Food Contact Polypropylene (FDA Approved)',
      'Switching Power': '10W max reed rating'
    },
    rating: 4.6,
    reviewsCount: 118,
    createdAt: '2026-02-03T00:00:00.000Z'
  },
  {
    id: 'spare-tds-adjuster-brass-mixing-valve',
    name: 'Precision Solid Brass TDS Adjuster Needle Valve 1/4"',
    category: 'spares',
    description: 'Allows fine-tuned blending of UF-filtered mineral water into RO permeate to adjust drinking water TDS level to the desired 100-150 ppm mineral sweet spot.',
    price: 380,
    wholesalePrice: 175,
    minWholesaleQty: 20,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    stock: 85,
    inStock: true,
    specifications: {
      'Body': 'Solid Machined Brass Needle Core with Chrome Body',
      'Adjustment': 'Micro-turn knurled thumb knob with lock-nut',
      'Connection': 'Dual 1/4" quick-connect push-in collets'
    },
    rating: 4.8,
    reviewsCount: 94,
    createdAt: '2026-02-08T00:00:00.000Z'
  },
  {
    id: 'spare-membrane-housing-vessel-1812',
    name: 'High-Burst 1812 / 2012 Standard RO Membrane Housing Vessel',
    category: 'spares',
    description: 'Thick-walled molded polypropylene pressure vessel with dual silicone leak-proof O-rings. Accommodates all standard 50, 75, 80, and 100 GPD residential RO membranes.',
    price: 499,
    wholesalePrice: 210,
    minWholesaleQty: 20,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 110,
    inStock: true,
    specifications: {
      'Internal Size': '1812 / 2012 residential standard',
      'Burst Pressure': 'Tested up to 350 PSI burst strength',
      'Seal': 'Double NBR rubber O-ring groove in cap',
      'Ports': '1x 1/8" Inlet, 1x 1/8" Pure Outlet, 1x 1/8" Brine Drain'
    },
    rating: 4.9,
    reviewsCount: 152,
    createdAt: '2026-02-15T00:00:00.000Z'
  },
  {
    id: 'spare-pre-filter-housing-10inch-clear',
    name: '10-Inch Transparent Bowl Pre-Filter Housing with Brass Ports',
    category: 'spares',
    description: 'Crystal-clear transparent housing allows visual inspection of external sediment filter dirt accumulation without needing to open the canister. Heavy-duty 1/2" brass female inlet/outlet threads.',
    price: 899,
    wholesalePrice: 420,
    minWholesaleQty: 10,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    stock: 65,
    inStock: true,
    specifications: {
      'Bowl': 'High impact shatterproof PET transparent sump',
      'Cap': 'Reinforced PP head with brass thread inserts & pressure relief button',
      'Port Size': '1/2" or 3/8" BSP Female Brass Inserts',
      'Max Operating Pressure': '125 PSI'
    },
    rating: 4.7,
    reviewsCount: 167,
    createdAt: '2026-02-22T00:00:00.000Z'
  },
  {
    id: 'spare-fittings-tubing-pro-service-kit',
    name: 'Master RO Service Kit: 20x Push-Fit Connectors + 10m Food-Grade Pipe + Spanner',
    category: 'spares',
    description: 'Comprehensive maintenance kit containing 10x 1/4" elbow connectors, 4x union tees, 2x bulkheads, 4x stem elbows, 10 meters NSF food-grade white tubing, and a heavy housing spanner wrench.',
    price: 799,
    wholesalePrice: 380,
    minWholesaleQty: 12,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stock: 80,
    inStock: true,
    specifications: {
      'Tubing': '10 Meters 1/4" OD High-Pressure Food Contact Polyethylene',
      'Fittings': '20 Pieces Assorted Quick-Fit Connectors with Stainless Locking Teeth',
      'Wrench': 'Ergonomic 10" Pre-Filter & RO Housing Spanner',
      'Teflon Tape': '2x High-density PTFE thread seal rolls included'
    },
    rating: 4.9,
    reviewsCount: 220,
    createdAt: '2026-03-01T00:00:00.000Z'
  }
];

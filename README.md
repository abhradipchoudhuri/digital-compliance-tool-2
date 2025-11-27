# Digital Compliance Tool - Legal Copy Generator

An Electron desktop application for generating compliant legal copy for digital and traditional marketing materials across Brown-Forman's global brand portfolio.

[![Electron](https://img.shields.io/badge/Electron-37.3.1-47848F?style=flat&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Architecture](#architecture)
- [Excel Data Structure](#excel-data-structure)
- [Key Features in Detail](#key-features-in-detail)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

## Overview

The Digital Compliance Tool is an Electron desktop application built for Brown-Forman Corporation's Marketing Compliance Team. It replaces an Excel-based workflow and Google Sites implementation for generating legally compliant marketing copy.

### Background

The previous system relied on manual Excel lookups across multiple sheets, a Google Sites interface, and manual copy-paste workflows. This resulted in errors, limited offline capability, and maintenance difficulties.

### Current Implementation

This application provides:
- Automated legal copy generation for 40+ brands across 179 countries
- Support for 27 different asset types
- Complex compliance rule processing (TTB statements, trademarks, responsibility messages)
- Offline operation with local Excel data storage
- Real-time generation with proper formatting

## Features

## Features

### Core Functionality

- Global brand support: Generate compliant copy for 40+ brands across 179 countries
- Asset type coverage: Support for 27 different asset types including email footers, social media, web footers, GIFs, and videos
- Real-time generation: Instant copy generation with proper legal formatting
- Clipboard integration: One-click copy with hyperlinks preserved
- Multi-brand support: Handle single brands, multi-brand portfolios, and FOB (Free On Board) brands
- Theme support: Light and dark mode with localStorage persistence
- Modern UI: React-based interface with Tailwind CSS styling

### Compliance Features

#### TTB (Tax and Trade Bureau) Statements
- Automatic TTB statement generation for US and Puerto Rico
- Version selection (Full, Tightened, Limited Character)
- Class-based statement construction for same-class multi-brand selections
- Special handling for Jack Daniel's portfolio (Tennessee Whiskey, Rye, etc.)

#### Trademark Generation
- Language-specific trademark formatting
- Singular vs. plural brand handling
- Entity and portfolio trademark logic
- Forward Notice support
- Third-party trademark attribution (e.g., Coca-Cola partnerships)

#### Responsibility Messages
- Country and brand-specific drinking responsibility messages
- US/Puerto Rico special handling with entity-level messages
- Language-dependent variables and formatting

### Special Brand Handling

- Jack Daniel's Portfolio: Intelligent handling of 15+ expressions with class-type detection
- Jack Daniel's & Coca-Cola: Special trademark language with Third Party Rights
- FOB Brands: Isolation logic preventing mixing with regular brands
- Multi-Brand Selection: Validation rules for compatible brand combinations

### User Experience Features

- Smart brand filtering with alphabetical sorting and search functionality
- Selected brand chips with visual display and one-click removal
- Real-time error validation with contextual error messages
- Asset type instructions displayed contextually for specific asset types
- Clear all selection functionality for quick reset
- Console log export (Ctrl+Shift+L) for debugging purposes

## Tech Stack

### Frontend
- **React 19.1.1** - Modern UI component library
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Lucide React 0.542.0** - Beautiful icon library

### Desktop Framework
- **Electron 37.3.1** - Cross-platform desktop application framework
- **Webpack 5** - Module bundler with dev server
- **Babel 7** - JavaScript transpiler

### Data Processing
- **ExcelJS 4.4.0** - Secure Excel file parsing and manipulation
- **PapaParse 5.5.3** - CSV parsing library

### Development Tools
- **ESLint 9** - Code quality and style enforcement
- **Prettier 3** - Code formatting
- **Concurrently** - Run multiple npm commands simultaneously
- **Wait-on** - Wait for resources to be available

## Project Structure

```
digital-compliance-tool-2/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.js        # Application entry point
│   │   ├── menu.js        # Application menu
│   │   └── preload.js     # Preload script
│   │
│   └── renderer/          # React application
│       ├── App.jsx        # Main app component
│       ├── index.js       # React entry point
│       ├── index.html     # HTML template
│       │
│       ├── services/      # Business logic
│       │   ├── excelService.js      # Excel data loading & parsing
│       │   ├── templateService.js   # Template processing
│       │   └── copyGenerator.js     # Copy generation engine
│       │
│       └── styles/        # CSS files
│           └── globals.css
│
├── data/                  # Excel data files
│   └── EXTERNAL__Trademark_Tool_Data_LCG_2_0.xlsx
│
├── config/               # Configuration files
│   └── webpack.config.js
│
├── assets/               # Application assets
│   └── icons/
│
├── docs/                 # Documentation
│
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/abhradipchoudhuri/digital-compliance-tool-2.git
cd digital-compliance-tool-2
```

2. **Install dependencies**
```bash
npm install
```

3. **Place Excel data file**
```bash
# Ensure the Excel file is in the data/ directory:
data/EXTERNAL__Trademark_Tool_Data_LCG_2_0.xlsx
```

4. **Start the application**
```bash
npm start
```

The application will:
- Start webpack dev server on http://localhost:3000
- Launch Electron window automatically
- Enable hot-reload for development

## Usage Guide

### Basic Workflow

1. **Select Asset Type**: Choose from 27 asset types (e.g., "Email Footer", "Social Media Post")
2. **Select Country**: Pick from 179 countries to filter available brands
3. **Select Brands**: Check one or more brands (subject to validation rules)
4. **Generate**: Click "Generate Legal Copy" button
5. **Copy**: Use "Copy to Clipboard" to get formatted text with hyperlinks

### Brand Selection Rules

#### Single Brand
- Select any single brand
- Automatically shows entity if different from brand name

#### Multi-Brand (Same Entity)
- Example: Jack Daniel's Old No.7 + Jack Daniel's Bonded Series
- Generates combined trademark with entity
- Same-class brands show class type with ABV range

#### Multi-Brand (Different Entities)
- Example: Woodford Reserve + Old Forester
- Shows consolidated Brown-Forman entity
- Uses plural trademark format

#### Special Cases
- Multi-Brand: Can only be selected alone (isolation required)
- FOB Brands: Can only be mixed with other FOB brands
- Jack Daniel's & Coca-Cola: Uses special Third Party Rights language

### Dark Mode

Toggle between light and dark themes using the moon/sun icon in the top-right corner. Theme preference is persisted to localStorage.

### Keyboard Shortcuts

- `Ctrl+Shift+L`: Copy all console logs to clipboard (development feature)

### Asset Type Instructions

Certain asset types display additional instructions in the output panel. For example, GIF assets include guidance on text sizing and positioning.

## Architecture

### Data Flow

```
Excel File (7 Sheets)
    ↓
excelService.js (Parse & Load)
    ↓
App.jsx (User Selections)
    ↓
templateService.js (Coordinate Generation)
    ↓
copyGenerator.js (Generate Copy)
    ↓
Generated Copy (HTML + Plain Text)
```

### Key Services

#### 1. **excelService.js**
- Loads and parses Excel file using ExcelJS
- Processes 7 sheets with different structures
- Provides data access methods:
  - `getBrands()` - All brand data
  - `getCountries()` - Country list
  - `getAssetTypes()` - Asset type list
  - `getBrandsForCountry(code)` - Filtered brands

#### 2. **copyGenerator.js** (1,787 lines)
The core engine that handles:

- **TTB Statement Generation**
  - `requiresTTB(country)` - Check if country needs TTB
  - `buildTTBSection()` - Construct TTB statements
  - Same-class vs different-class detection
  - ABV range construction
  - Portfolio statement selection

- **Trademark Generation**
  - `buildTrademarkSection()` - Generate trademarks
  - Singular/plural logic
  - Portfolio prefix handling (Jack Daniel's, Old Forester, Woodford Reserve)
  - Language-specific formatting
  - Entity copyright logic

- **US Responsibility Message**
  - `getUSResponsibilityMessage()` - Get RDM
  - Entity-level lookup for multi-brand same-entity
  - Brand-specific messages
  - Generic fallback

- **Forward Notice**
  - `getForwardNotice()` - Get forward notice text
  - Brand-specific requirements
  - Language-dependent variables

- **Placeholder Replacement**
  - `buildCopyFromTemplate()` - Replace placeholders
  - Order-dependent replacement logic
  - Hyperlink preservation

#### 3. **templateService.js**
- Coordinates the copy generation workflow
- Validates inputs
- Calls copyGenerator methods
- Returns formatted results

### Excel Data Structure

The application processes a multi-sheet Excel file:

#### Sheet 1: Trademark Config
- Display Names, Brand Names, Entity Names
- Asset Type mappings
- Forward Notice Types
- TTB Types

#### Sheet 2: Trademark Language
- Language-specific trademark text
- Registered Language (singular/plural)
- Reserve Language
- **Third Party Rights** (for Coca-Cola)

#### Sheet 3: Trademark Structure
- Template structures for trademark types

#### Sheet 4: Language Dependent Variables
- Responsibility Language
- Forward Notice (Full/Tightened)
- Email statements
- Legal document links

#### Sheet 5: Overall Structure
- Asset type templates with placeholders

#### Sheet 6: CountryLanguage
- Country abbreviations
- Language mappings

#### Sheet 7: TTB Statements
- Brand Name
- Multi-brand indicator
- TTB Statement - Full
- TTB Statement - Tightened
- TTB Statement - Limited Character
- **Class & Type** (Column D)

#### Sheet 8: Brand Availability
- Brand availability by country
- Entity information
- Third Party information

#### Sheet 9: US Responsibility Message
- Brand-specific US RDM
- Entity-level messages

## Key Features in Detail

### 1. TTB Statement Logic

**US and Puerto Rico Only**

TTB statements are required for alcohol marketing in US and Puerto Rico:

```javascript
// Single Brand
"Tennessee Whiskey, 40% Alc. by Vol. (80 proof.)"

// Multi-Brand Same Class
"Tennessee Whiskey, Tennessee Rye Whiskey, 40% - 50% Alc. by Vol. (80 - 100 proof.)"

// Multi-Brand Different Class
"©2024 JACK DANIEL DISTILLERY, Lynchburg, TN."
```

**Special Logic:**
- Same-class brands: Show class type with ABV range
- Different-class brands: Show entity information only
- Jack Daniel's: Detect 15+ expressions with different classes

### 2. Trademark Generation

**Single Brand:**
```
Jack Daniel's is a registered trademark. ©2024 Jack Daniel's. All rights reserved.
```

**Multi-Brand (Same Entity):**
```
Jack Daniel's and Jack Daniel's Bonded Series are registered trademarks. ©2024 Jack Daniel's. All rights reserved.
```

**Multi-Brand (Different Entities):**
```
Woodford Reserve and Old Forester are registered trademarks. ©2024 Brown-Forman. All rights reserved.
```

**Jack Daniel's & Coca-Cola:**
```
Jack Daniel's & Coca Cola 5% ALC/VOL (RTD) is a registered trademark. ©2024 Jack Daniel's and The Coca-Cola Company. COCA-COLA is a trademark of the Coca-Cola Company.
```

### 3. Language Support

The system supports 40+ languages with proper trademark formatting:

- **Spanish**: "es una marca registrada" / "Todos los derechos reservados"
- **German**: "ist eine eingetragene Marke" / "Alle Rechte vorbehalten"
- **French**: "est une marque déposée" / "Tous droits réservés"
- **Chinese**: "为注册商标" / "版权所有"
- And many more...

**Fallback Logic**: If Third Party Rights text is missing for a language (e.g., Czech, Danish), the system falls back to English (Default).

### 4. Brand Validation

Real-time validation prevents invalid combinations:

```javascript
// Valid combinations
Jack Daniel's Old No.7 (single)
Jack Daniel's Old No.7 + Jack Daniel's Bonded Series (same entity)
Woodford Reserve + Old Forester (different entities)

// Invalid combinations
Jack Daniel's Old No.7 + Bar-Fabric (multi-brand) // Multi-brand must be alone
Jack Daniel's (FOB) + Woodford Reserve // Can't mix FOB with non-FOB
Jack Daniel's + Jack Daniel's (multi-brand) // Can't mix single with multi-brand
```

### 5. Fuzzy Brand Name Matching

The system uses fuzzy matching to handle brand name inconsistencies across sheets:

```javascript
// Excel Inconsistencies
"Jack Daniel's Old N.7" (Trademark Config)
"Jack Daniel's Old No.7" (Brand Availability)
"Old No.7" (TTB Statements)

// System normalizes to:
"oldno7" for matching
```

### 6. Console Log Export

**Developer Feature**: Press `Ctrl+Shift+L` to copy all console logs to clipboard for debugging.

Captures:
- Timestamp
- Log level (LOG/WARN/ERROR)
- Message content
- Structured data (JSON)

## Development

### Available Scripts

```bash
# Development
npm start              # Start webpack dev server + Electron
npm run webpack-dev    # Start webpack dev server only
npm run electron       # Start Electron only

# Production Build
npm run webpack-prod   # Build production webpack bundle
npm run build          # Build for distribution
npm run pack           # Package without installer

# Code Quality
npm run lint           # Run ESLint
npm run format         # Run Prettier
```

### Development Workflow

1. **Make changes** to files in `src/`
2. **Webpack hot-reloads** automatically
3. **Test in Electron** window
4. **Check console** for any errors
5. **Commit** with descriptive messages

### Adding New Features

#### To Add a New Asset Type:
1. Update Excel file: `Overall Structure` sheet
2. Add template with placeholders
3. System will automatically load it

#### To Add a New Country:
1. Update Excel file: `CountryLanguage` sheet
2. Update Excel file: `Brand Availability` sheet
3. System will automatically filter brands

#### To Add a New Brand:
1. Update Excel file: `Brand Availability` sheet
2. Update Excel file: `Trademark Config` sheet
3. Update Excel file: `TTB Statements` sheet (if US/PR)
4. System will automatically include it

## Troubleshooting

### Common Issues

#### 1. Excel File Not Found
```
Error: Cannot find Excel file
```
**Solution**: Ensure `data/EXTERNAL__Trademark_Tool_Data_LCG_2_0.xlsx` exists

#### 2. Brands Not Loading
```
0 brands available
```
**Solution**: 
- Check if country has brands in Brand Availability sheet
- Verify Excel file loaded successfully (check console)

#### 3. TTB Statement Missing
```
TTB statement not found for brand
```
**Solution**: 
- Verify brand exists in TTB Statements sheet
- Check brand name matches exactly
- Check Column D (Class & Type) is populated

#### 4. Trademark Shows [object Object]
```
[object Object] is a registered trademark
```
**Solution**: 
- Already fixed in copyGenerator.js with `safeGetValue()` wrapper
- Ensures proper text extraction from Excel cells

#### 5. Dark Mode Not Persisting
```
Dark mode resets on refresh
```
**Solution**: 
- Check localStorage is enabled in Electron
- Verify no security policies blocking storage

### Debug Mode

To see detailed logs:
1. Open DevTools in Electron (`Ctrl+Shift+I`)
2. Check Console tab
3. Look for logs from:
   - `excelService.js` (data loading)
   - `copyGenerator.js` (copy generation)
   - `App.jsx` (user actions)

## Contributing

### Development Guidelines

1. **Code Style**: Follow ESLint and Prettier configurations
2. **Commit Messages**: Use clear, descriptive commit messages
3. **Testing**: Test thoroughly before committing
4. **Documentation**: Update README for significant changes

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with clear commits
3. Test thoroughly
4. Update documentation
5. Submit PR with description

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Team

**Marketing Compliance Team**  
Brown-Forman Corporation


// EcoSphere Carbon Footprint Awareness Platform - Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // Helpers for Security and Efficiency
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function setTipText(element, text) {
        element.textContent = '';
        const parts = text.split(/(<strong>.*?<\/strong>)/g);
        parts.forEach(part => {
            if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
                const strong = document.createElement('strong');
                strong.textContent = part.slice(8, -9);
                element.appendChild(strong);
            } else {
                element.appendChild(document.createTextNode(part));
            }
        });
    }

    // -------------------------------------------------------------
    // 1. STATE MANAGEMENT
    // -------------------------------------------------------------
    let state = {
        inputs: {
            carKm: 150,
            carType: 'petrol',
            flights: 10,
            transit: 50,
            electricity: 300,
            cleanEnergy: 0,
            heatingGas: 80,
            heatingOil: 0,
            diet: 'heavy-meat',
            organic: 20,
            clothing: 20,
            electronics: 2,
            recycling: 30
        },
        commitments: [],
        simAdoption: 100
    };

    // Action database definition
    const actionsData = [
        {
            id: 'led_swap',
            title: '100% LED Bulb Swap',
            category: 'energy',
            desc: 'Replace all incandescent or halogen bulbs with energy-efficient LED lights.',
            impact: 150 // kg CO2e / year
        },
        {
            id: 'meatless_monday',
            title: 'Meatless Mondays',
            category: 'diet',
            desc: 'Eliminate meat from your diet just one day a week for a full year.',
            impact: 400
        },
        {
            id: 'transit_commute',
            title: 'Transit Commuting',
            category: 'transport',
            desc: 'Switch from driving to using public transit for your daily work commute.',
            impact: 1000
        },
        {
            id: 'cold_wash',
            title: 'Cold Wash & Line Dry',
            category: 'energy',
            desc: 'Wash clothes at 30°C and air-dry them instead of using a dryer.',
            impact: 180
        },
        {
            id: 'thermostat_down',
            title: 'Lower Thermostat by 2°C',
            category: 'energy',
            desc: 'Keep your home slightly cooler in winter to save on central gas heating.',
            impact: 350
        },
        {
            id: 'flight_free',
            title: 'Go Flight-Free',
            category: 'transport',
            desc: 'Avoid taking a commercial flight for holiday travel this year.',
            impact: 1500
        },
        {
            id: 'local_grow',
            title: 'Grow Your Own Herbs & Veg',
            category: 'diet',
            desc: 'Cultivate fresh home crops to offset packaged grocery store transport.',
            impact: 80
        },
        {
            id: 'secondhand',
            title: '75% Secondhand Fashion',
            category: 'lifestyle',
            desc: 'Thrift or buy used apparel rather than buying fast fashion items.',
            impact: 250
        }
    ];

    // Achievements database
    const badgesData = [
        { id: 'badge-initiate', title: 'Eco Initiate', desc: 'Kickstarted the journey by calculating your footprint.', icon: 'fa-seedling' },
        { id: 'badge-transit', title: 'Transit Star', desc: 'Commute by public transit or live flight-free.', icon: 'fa-bus' },
        { id: 'badge-solar', title: 'Solar Spark', desc: 'Adopt over 50% renewable energy for electricity.', icon: 'fa-solar-panel' },
        { id: 'badge-plant', title: 'Plant Powered', desc: 'Adopt a vegan or vegetarian diet style.', icon: 'fa-carrot' },
        { id: 'badge-zero', title: 'Zero Waste Hero', desc: 'Achieve a household recycling rate of 75% or more.', icon: 'fa-recycle' },
        { id: 'badge-advocate', title: 'Climate Advocate', desc: 'Commit to at least 3 active carbon reduction actions.', icon: 'fa-leaf' },
        { id: 'badge-carbon-cut', title: 'Carbon Cutthroat', desc: 'Reduce your projected future footprint below 3.0 tonnes.', icon: 'fa-shield-halved' }
    ];

    // LocalStorage keys
    const STORAGE_KEY = 'ecosphere_user_state';

    // Cache DOM Elements for Efficiency
    const hdrCurrentVal = document.getElementById('hdr-current-val');
    const hdrReductionVal = document.getElementById('hdr-reduction-val');
    const lblTotalFootprint = document.getElementById('lbl-total-footprint');
    const lblProjectedFootprint = document.getElementById('lbl-projected-footprint');
    const barCompare = document.getElementById('bar-footprint-compare');
    const pctDiff = document.getElementById('lbl-percentage-diff');
    const lblCommitmentPercentage = document.getElementById('lbl-commitment-percentage');
    const barCommitmentProgress = document.getElementById('bar-commitment-progress');
    const lblCommitmentStatus = document.getElementById('lbl-commitment-status');
    const lblDynamicTip = document.getElementById('lbl-dynamic-tip');
    
    const simTemp = document.getElementById('sim-temp-val');
    const simSea = document.getElementById('sim-sea-val');
    const simWeather = document.getElementById('sim-weather-val');
    const simUserScore = document.getElementById('sim-user-score');
    const simGlobalOutput = document.getElementById('sim-global-output');
    const simBudgetStatus = document.getElementById('sim-budget-status');
    const simAlertBox = document.getElementById('sim-alert-box');
    const simAlertTitle = document.getElementById('sim-alert-title');
    const simAlertDesc = document.getElementById('sim-alert-desc');
    
    const actionsGridContainer = document.getElementById('actions-grid-container');
    const badgesGridContainer = document.getElementById('badges-grid-container');
    const sidebarRank = document.getElementById('txt-user-rank');
    const miniBadgeIcon = document.getElementById('mini-badge-icon');

    // -------------------------------------------------------------
    // 2. LOAD AND SANITIZE CACHED STATE
    // -------------------------------------------------------------
    function validateAndSanitizeState(parsed) {
        if (!parsed || typeof parsed !== 'object') return null;
        
        const validatedInputs = {};
        const defaults = {
            carKm: 150,
            carType: 'petrol',
            flights: 10,
            transit: 50,
            electricity: 300,
            cleanEnergy: 0,
            heatingGas: 80,
            heatingOil: 0,
            diet: 'heavy-meat',
            organic: 20,
            clothing: 20,
            electronics: 2,
            recycling: 30
        };

        const validCarTypes = ['petrol', 'diesel', 'hybrid', 'electric'];
        const validDiets = ['heavy-meat', 'mod-meat', 'vegetarian', 'vegan'];

        // Validate inputs
        if (parsed.inputs && typeof parsed.inputs === 'object') {
            for (const key in defaults) {
                const val = parsed.inputs[key];
                if (key === 'carType') {
                    validatedInputs.carType = validCarTypes.includes(val) ? val : defaults.carType;
                } else if (key === 'diet') {
                    validatedInputs.diet = validDiets.includes(val) ? val : defaults.diet;
                } else {
                    const num = Number(val);
                    validatedInputs[key] = (!isNaN(num) && num >= 0) ? num : defaults[key];
                }
            }
        } else {
            return null;
        }

        // Validate commitments
        let validatedCommitments = [];
        if (Array.isArray(parsed.commitments)) {
            const validActionIds = actionsData.map(a => a.id);
            validatedCommitments = parsed.commitments.filter(id => validActionIds.includes(id));
        }

        // Validate simAdoption
        let validatedSimAdoption = 100;
        if (parsed.simAdoption !== undefined) {
            const num = Number(parsed.simAdoption);
            validatedSimAdoption = (!isNaN(num) && num >= 0 && num <= 100) ? num : 100;
        }

        return {
            inputs: validatedInputs,
            commitments: validatedCommitments,
            simAdoption: validatedSimAdoption
        };
    }

    function loadSavedState() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const sanitized = validateAndSanitizeState(parsed);
                if (sanitized) {
                    state = sanitized;
                }
            } catch (e) {
                console.error("Failed to load local storage state: ", e);
            }
        }
    }

    function saveCurrentState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // Initialize application state
    loadSavedState();


    // -------------------------------------------------------------
    // 3. UI TAB NAVIGATION
    // -------------------------------------------------------------
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const mainHeading = document.getElementById('main-heading');
    const mainSubtitle = document.getElementById('main-subtitle');

    const tabHeaders = {
        'dashboard-tab': { title: 'Environmental Dashboard', subtitle: 'Real-time carbon analysis and personalized reduction pathways.' },
        'calculator-tab': { title: 'Carbon Footprint Calculator', subtitle: 'Estimate your annual greenhouse gas contributions across main categories.' },
        'actions-tab': { title: 'Action & Commitments Planner', subtitle: 'Identify, simulate, and commit to impactful reductions in daily life.' },
        'simulator-tab': { title: 'Global Climate Simulator', subtitle: 'Project the planetary feedback of humanity adopting your lifestyle.' },
        'badges-tab': { title: 'Achievements & Badges', subtitle: 'Unlock sustainability recognitions for carbon reduction efforts.' }
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    function switchTab(tabId) {
        // Update nav items
        navItems.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Show/hide panes
        tabPanels.forEach(panel => {
            if (panel.id === tabId) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Update headers
        const headerInfo = tabHeaders[tabId];
        if (headerInfo) {
            mainHeading.textContent = headerInfo.title;
            mainSubtitle.textContent = headerInfo.subtitle;
        }

        // Scroll to top of panel smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // -------------------------------------------------------------
    // 4. CALCULATOR FORM STEP CONTROLLER
    // -------------------------------------------------------------
    let currentStep = 1;
    const calcStepButtons = document.querySelectorAll('.calc-step-btn');
    const calcStepPanes = document.querySelectorAll('.calc-step-pane');
    const btnCalcPrev = document.getElementById('btn-calc-prev');
    const btnCalcNext = document.getElementById('btn-calc-next');

    calcStepButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepNum = parseInt(btn.getAttribute('data-step'));
            goToCalculatorStep(stepNum);
        });
    });

    btnCalcPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            goToCalculatorStep(currentStep - 1);
        }
    });

    btnCalcNext.addEventListener('click', () => {
        if (currentStep < 4) {
            goToCalculatorStep(currentStep + 1);
        } else {
            // Finished calculator, switch to dashboard
            switchTab('dashboard-tab');
        }
    });

    function goToCalculatorStep(stepNum) {
        currentStep = stepNum;

        // Toggle nav buttons
        calcStepButtons.forEach(btn => {
            const num = parseInt(btn.getAttribute('data-step'));
            if (num === stepNum) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Toggle panes
        calcStepPanes.forEach(pane => {
            if (pane.id === `calc-step-pane-${stepNum}`) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });

        // Disable/enable prev/next button controls
        btnCalcPrev.disabled = stepNum === 1;
        btnCalcNext.textContent = '';
        if (stepNum === 4) {
            btnCalcNext.appendChild(document.createTextNode('Go to Dashboard '));
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-square-check';
            btnCalcNext.appendChild(icon);
        } else {
            btnCalcNext.appendChild(document.createTextNode('Next '));
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-arrow-right';
            btnCalcNext.appendChild(icon);
        }
    }

    // -------------------------------------------------------------
    // 5. INPUT SYNC & HANDLERS
    // -------------------------------------------------------------
    // Binding sliders & UI elements
    const inputsConfig = [
        { id: 'range-car-km', stateKey: 'carKm', displayId: 'val-car-km', suffix: ' km' },
        { id: 'range-flights', stateKey: 'flights', displayId: 'val-flights', suffix: ' hrs' },
        { id: 'range-transit', stateKey: 'transit', displayId: 'val-transit', suffix: ' km' },
        { id: 'range-electricity', stateKey: 'electricity', displayId: 'val-electricity', suffix: ' kWh' },
        { id: 'range-clean-energy', stateKey: 'cleanEnergy', displayId: 'val-clean-energy', suffix: '%' },
        { id: 'range-heating-gas', stateKey: 'heatingGas', displayId: 'val-heating-gas', suffix: ' m³' },
        { id: 'range-heating-oil', stateKey: 'heatingOil', displayId: 'val-heating-oil', suffix: ' L' },
        { id: 'range-organic', stateKey: 'organic', displayId: 'val-organic', suffix: '%' },
        { id: 'range-clothing', stateKey: 'clothing', displayId: 'val-clothing', suffix: ' items' },
        { id: 'range-electronics', stateKey: 'electronics', displayId: 'val-electronics', suffix: ' devices' },
        { id: 'range-recycling', stateKey: 'recycling', displayId: 'val-recycling', suffix: '%' },
        { id: 'range-sim-adoption', stateKey: 'simAdoption', displayId: 'val-sim-adoption', suffix: '%' }
    ];

    // Sync state to DOM input elements on load
    function syncStateToDOM() {
        inputsConfig.forEach(conf => {
            const el = document.getElementById(conf.id);
            const val = state.inputs[conf.stateKey] !== undefined ? state.inputs[conf.stateKey] : state[conf.stateKey];
            if (el) {
                el.value = val;
                const display = document.getElementById(conf.displayId);
                if (display) display.textContent = `${val}${conf.suffix}`;
            }
        });

        // Car type button active states
        const carButtons = document.querySelectorAll('#group-car-type .btn-toggle');
        carButtons.forEach(btn => {
            if (btn.getAttribute('data-value') === state.inputs.carType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Diet toggle active states
        const dietButtons = document.querySelectorAll('[data-value^="heavy-meat"], [data-value^="mod-meat"], [data-value^="vegetarian"], [data-value^="vegan"]');
        dietButtons.forEach(btn => {
            if (btn.getAttribute('data-value') === state.inputs.diet) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    const debouncedRecalculate = debounce(recalculateAll, 100);

    // Attach listeners for range sliders
    inputsConfig.forEach(conf => {
        const el = document.getElementById(conf.id);
        if (el) {
            el.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                const display = document.getElementById(conf.displayId);
                if (display) display.textContent = `${val}${conf.suffix}`;

                if (conf.stateKey === 'simAdoption') {
                    state.simAdoption = val;
                } else {
                    state.inputs[conf.stateKey] = val;
                }
                
                debouncedRecalculate();
                saveCurrentState();
            });
        }
    });

    // Car type buttons click
    const carButtons = document.querySelectorAll('#group-car-type .btn-toggle');
    carButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            carButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.inputs.carType = btn.getAttribute('data-value');
            recalculateAll();
            saveCurrentState();
        });
    });

    // Diet buttons click
    const dietButtons = document.querySelectorAll('[data-value="heavy-meat"], [data-value="mod-meat"], [data-value="vegetarian"], [data-value="vegan"]');
    dietButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dietButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.inputs.diet = btn.getAttribute('data-value');
            recalculateAll();
            saveCurrentState();
        });
    });

    // Reset data button
    const btnResetData = document.getElementById('btn-reset-data');
    btnResetData.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all inputs to defaults?")) {
            state.inputs = {
                carKm: 150,
                carType: 'petrol',
                flights: 10,
                transit: 50,
                electricity: 300,
                cleanEnergy: 0,
                heatingGas: 80,
                heatingOil: 0,
                diet: 'heavy-meat',
                organic: 20,
                clothing: 20,
                electronics: 2,
                recycling: 30
            };
            state.commitments = [];
            state.simAdoption = 100;
            
            syncStateToDOM();
            recalculateAll();
            saveCurrentState();
        }
    });

    // -------------------------------------------------------------
    // 6. CARBON CALCULATION CORE MODEL
    // -------------------------------------------------------------
    // (Delegated to external emissionsCalculator.js module)

    // -------------------------------------------------------------
    // 7. CHART.JS CONFIGURATION & CREATION
    // -------------------------------------------------------------
    let breakdownChart = null;
    let comparisonChart = null;

    function initCharts() {
        if (typeof Chart === 'undefined') {
            console.warn("Chart.js is not loaded. Visual graphs will be disabled.");
            return;
        }
        const ctxBreakdown = document.getElementById('chart-emissions-breakdown').getContext('2d');
        const ctxComparison = document.getElementById('chart-emissions-comparison').getContext('2d');

        // Styles matching our neon dark theme
        const colors = {
            transport: '#3b82f6', // bright blue
            energy: '#fbbf24',    // golden amber
            diet: '#34d399',      // mint green
            lifestyle: '#a78bfa'  // soft violet
        };

        // A. Breakdown Donut Chart
        breakdownChart = new Chart(ctxBreakdown, {
            type: 'doughnut',
            data: {
                labels: ['Transport', 'Home Energy', 'Diet & Food', 'Lifestyle & Shopping'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [colors.transport, colors.energy, colors.diet, colors.lifestyle],
                    borderColor: '#11161d',
                    borderWidth: 2,
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 11, weight: '500' },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
                        bodyFont: { family: 'Inter', size: 12 },
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const val = context.raw;
                                return ` ${val.toFixed(2)} t CO₂e (${context.parsed}%)`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });

        // B. Benchmark Comparison Bar Chart
        comparisonChart = new Chart(ctxComparison, {
            type: 'bar',
            data: {
                labels: ['You', 'Projected', 'Global Avg', 'US Avg', 'Target (IPCC)'],
                datasets: [{
                    label: 'Tonnes CO₂e / Year',
                    data: [0, 0, 4.0, 16.0, 2.0],
                    backgroundColor: [
                        '#fbbf24', // Yellow for current user
                        '#10b981', // Emerald for projected user
                        '#475569', // Muted slate for global average
                        '#ef4444', // Warning red for US average
                        'rgba(16, 185, 129, 0.2)' // Frosted emerald for sustainable target
                    ],
                    borderColor: [
                        '#fbbf24',
                        '#10b981',
                        '#475569',
                        '#ef4444',
                        '#10b981'
                    ],
                    borderWidth: 1.5,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleFont: { family: 'Outfit', size: 13 },
                        bodyFont: { family: 'Inter', size: 12 }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Inter' } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter' } }
                    }
                }
            }
        });
    }

    function updateCharts(breakdownKg, currentTotalTonnes, projectedTotalTonnes) {
        if (typeof Chart === 'undefined' || !breakdownChart || !comparisonChart) return;

        // Convert kg to tonnes for breakdown display
        const transportT = breakdownKg.transport / 1000;
        const energyT = breakdownKg.energy / 1000;
        const dietT = breakdownKg.diet / 1000;
        const lifestyleT = breakdownKg.lifestyle / 1000;

        // Update donut data
        breakdownChart.data.datasets[0].data = [
            parseFloat(transportT.toFixed(2)),
            parseFloat(energyT.toFixed(2)),
            parseFloat(dietT.toFixed(2)),
            parseFloat(lifestyleT.toFixed(2))
        ];
        breakdownChart.update();

        // Update comparison data
        comparisonChart.data.datasets[0].data = [
            parseFloat(currentTotalTonnes.toFixed(2)),
            parseFloat(projectedTotalTonnes.toFixed(2)),
            4.0,
            16.0,
            2.0
        ];
        comparisonChart.update();
    }

    // Initialize Charts immediately
    initCharts();

    // -------------------------------------------------------------
    // 8. RENDER DYNAMIC ACTIONS PLANNER & CHECKS
    // -------------------------------------------------------------
    function renderActionPlanner() {
        if (!actionsGridContainer) return;
        actionsGridContainer.textContent = ''; // Safe clear

        actionsData.forEach(action => {
            const isCommitted = state.commitments.includes(action.id);
            const card = document.createElement('div');
            card.className = `action-card ${isCommitted ? 'committed' : ''}`;
            card.id = `action-card-${action.id}`;

            // Header
            const header = document.createElement('div');
            header.className = 'action-card-header';
            
            const badge = document.createElement('span');
            badge.className = `action-category-badge action-cat-${action.category}`;
            badge.textContent = action.category;
            
            const icon = document.createElement('i');
            icon.className = `fa-solid ${isCommitted ? 'fa-circle-check text-emerald' : 'fa-circle-plus text-dark'}`;
            
            header.appendChild(badge);
            header.appendChild(icon);

            // Body
            const body = document.createElement('div');
            body.className = 'action-card-body';
            
            const title = document.createElement('h4');
            title.className = 'action-title';
            title.textContent = action.title;
            
            const desc = document.createElement('p');
            desc.className = 'action-desc';
            desc.textContent = action.desc;
            
            body.appendChild(title);
            body.appendChild(desc);

            // Footer
            const footer = document.createElement('div');
            footer.className = 'action-card-footer';
            
            const impactDiv = document.createElement('div');
            impactDiv.className = 'action-impact';
            
            const impactLbl = document.createElement('span');
            impactLbl.className = 'impact-lbl';
            impactLbl.textContent = 'Annual Savings';
            
            const impactVal = document.createElement('span');
            impactVal.className = 'impact-val';
            impactVal.textContent = `-${(action.impact / 1000).toFixed(2)} t CO₂e`;
            
            impactDiv.appendChild(impactLbl);
            impactDiv.appendChild(impactVal);

            const btnCommit = document.createElement('button');
            btnCommit.className = 'btn-commit';
            btnCommit.setAttribute('data-action-id', action.id);
            btnCommit.textContent = isCommitted ? 'Committed' : 'Commit';
            btnCommit.addEventListener('click', () => {
                toggleActionCommitment(action.id);
            });

            footer.appendChild(impactDiv);
            footer.appendChild(btnCommit);

            card.appendChild(header);
            card.appendChild(body);
            card.appendChild(footer);

            actionsGridContainer.appendChild(card);
        });
    }

    function toggleActionCommitment(actionId) {
        const index = state.commitments.indexOf(actionId);
        if (index > -1) {
            state.commitments.splice(index, 1);
        } else {
            state.commitments.push(actionId);
        }
        
        recalculateAll();
        saveCurrentState();
        renderActionPlanner(); // Re-render local states
    }

    // -------------------------------------------------------------
    // 9. DYNAMIC SIMULATOR & ADOPTION FORECASTS
    // -------------------------------------------------------------
    function updateSimulator(currentTotalTonnes) {
        // Calculations based on current footprint & world adoption percentage
        const adoptionFraction = state.simAdoption / 100;
        
        // Total global output:
        // Average footprint sustainable baseline target = 2.0 tonnes.
        // If adoption is 100%, total global footprint = currentTotalTonnes * 8 billion people
        // If adoption is 50%, 50% live like user, 50% live at target sustainable baseline (2.0 tonnes)
        const userGlobalOutput = currentTotalTonnes * 8.0; // In GigaTonnes (Gt)
        const baselineGlobalOutput = 2.0 * 8.0; // Sustainable baseline global output = 16 Gt
        
        const netGlobalOutput = (userGlobalOutput * adoptionFraction) + (baselineGlobalOutput * (1 - adoptionFraction));
        
        // Projected Temp rise:
        // 1.5°C is the threshold target at 2.0t per capita global lifestyle (16 Gt)
        // Scale temperature rise relative to excessive output
        // Every additional 10 Gt of global carbon output per year contributes approx +0.4°C long term warming.
        const excessGt = Math.max(0, netGlobalOutput - 16.0);
        const tempRise = 1.5 + (excessGt * 0.05); 
        
        // Sea level rise forecast in cm by 2050
        const seaLevelRiseCm = Math.round(tempRise * 13.5);
        
        // Extreme weather frequency multiplier
        const weatherRiskPct = Math.round((tempRise - 1.0) * 35);

        // DOM elements update
        if (simTemp) simTemp.textContent = `+${tempRise.toFixed(1)}°C`;
        if (simSea) simSea.textContent = `${seaLevelRiseCm} cm`;
        if (simWeather) simWeather.textContent = `+${weatherRiskPct}%`;

        // Update colors based on thresholds
        if (simTemp) {
            if (tempRise > 2.5) simTemp.className = 'dial-value text-red';
            else if (tempRise > 1.8) simTemp.className = 'dial-value text-amber';
            else simTemp.className = 'dial-value text-emerald';
        }
        if (simSea) {
            if (tempRise > 2.5) simSea.className = 'dial-value text-red';
            else if (tempRise > 1.8) simSea.className = 'dial-value text-amber';
            else simSea.className = 'dial-value text-emerald';
        }

        // Info table bindings

        if (simUserScore) simUserScore.textContent = `${currentTotalTonnes.toFixed(2)} t CO₂e/yr`;
        if (simGlobalOutput) simGlobalOutput.textContent = `${netGlobalOutput.toFixed(1)} Gt CO₂e`;
        
        if (simBudgetStatus) {
            if (netGlobalOutput > 16.0) {
                simBudgetStatus.textContent = 'Deficit';
                simBudgetStatus.className = 'info-val text-red';
            } else {
                simBudgetStatus.textContent = 'Surplus';
                simBudgetStatus.className = 'info-val text-emerald';
            }
        }

        // Alert styling matching simulator ranges
        if (simAlertBox) {
            if (tempRise >= 2.5) {
                simAlertBox.className = 'simulation-feedback-alert critical';
                simAlertTitle.textContent = 'Critical Biosphere Crisis';
                simAlertDesc.textContent = 'Catastrophic climate disruption: melting ice sheets, irreversible permafrost collapse, severe crop failures, and displaced populations.';
            } else if (tempRise > 1.5) {
                simAlertBox.className = 'simulation-feedback-alert warning';
                simAlertTitle.textContent = 'Severe Warning Range';
                simAlertDesc.textContent = 'Accelerated warming. Massive loss of coral reefs, increased coastal erosion, and double the frequency of severe floods and heatwaves.';
            } else {
                simAlertBox.className = 'simulation-feedback-alert safe';
                simAlertTitle.textContent = 'Stable Climate Target';
                simAlertDesc.textContent = 'Global safety threshold. Minimizes extreme weather impacts and protects biodiversity and global agriculture.';
            }
        }
    }

    function checkBadges(currentTotalTonnes, projectedTotalTonnes) {
        const inputs = state.inputs;
        let unlockedIds = [];

        // 1. Eco Initiate: Always unlocked
        unlockedIds.push('badge-initiate');

        // 2. Transit Star: transit >= 150 km/week OR flights == 0
        if (inputs.transit >= 150 || inputs.flights === 0) {
            unlockedIds.push('badge-transit');
        }

        // 3. Solar Spark: clean energy >= 50%
        if (inputs.cleanEnergy >= 50) {
            unlockedIds.push('badge-solar');
        }

        // 4. Plant Powered: vegan or vegetarian
        if (inputs.diet === 'vegan' || inputs.diet === 'vegetarian') {
            unlockedIds.push('badge-plant');
        }

        // 5. Zero Waste Hero: recycling >= 75%
        if (inputs.recycling >= 75) {
            unlockedIds.push('badge-zero');
        }

        // 6. Climate Advocate: Committed to at least 3 actions
        if (state.commitments.length >= 3) {
            unlockedIds.push('badge-advocate');
        }

        // 7. Carbon Cutthroat: Future footprint below 3.0t
        if (projectedTotalTonnes < 3.0) {
            unlockedIds.push('badge-carbon-cut');
        }

        // Render badges tab
        if (badgesGridContainer) {
            badgesGridContainer.textContent = ''; // Safe clear
            badgesData.forEach(badge => {
                const isUnlocked = unlockedIds.includes(badge.id);
                const badgeCard = document.createElement('div');
                badgeCard.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;

                const iconWrapper = document.createElement('div');
                iconWrapper.className = 'badge-card-icon';
                
                const icon = document.createElement('i');
                icon.className = `fa-solid ${badge.icon}`;
                iconWrapper.appendChild(icon);

                const title = document.createElement('h4');
                title.className = 'badge-card-title';
                title.textContent = badge.title;

                const desc = document.createElement('p');
                desc.className = 'badge-card-desc';
                desc.textContent = badge.desc;

                badgeCard.appendChild(iconWrapper);
                badgeCard.appendChild(title);
                badgeCard.appendChild(desc);

                badgesGridContainer.appendChild(badgeCard);
            });
        }

        // Update rank in sidebar
        const count = unlockedIds.length;
        
        let rankName = 'Eco Initiate';
        let rankIconClass = 'fa-seedling';

        if (count >= 6) {
            rankName = 'Eco Champion';
            rankIconClass = 'fa-earth-americas';
        } else if (count >= 4) {
            rankName = 'Carbon Crusader';
            rankIconClass = 'fa-shield-halved';
        } else if (count >= 2) {
            rankName = 'Green Protector';
            rankIconClass = 'fa-leaf';
        }

        if (sidebarRank) sidebarRank.textContent = rankName;
        if (miniBadgeIcon) {
            // Remove previous classes, set active icon
            miniBadgeIcon.className = `fa-solid ${rankIconClass} mini-badge-glow`;
        }
    }

    // -------------------------------------------------------------
    // 11. RECALCULATOR MASTER ENGINE
    // -------------------------------------------------------------
    function recalculateAll() {
        const emissions = calculateEmissions(state.inputs);
        const currentTotalTonnes = emissions.total / 1000;

        // Calculate commitments savings
        let totalSavingsKg = 0;
        state.commitments.forEach(actionId => {
            const act = actionsData.find(a => a.id === actionId);
            if (act) {
                totalSavingsKg += act.impact;
            }
        });
        const savingsTonnes = totalSavingsKg / 1000;
        
        // Projected footprint
        // Ensuring carbon footprint doesn't fall below a absolute minimum of 0.4 tonnes (breathing, standard base metab)
        const projectedTotalTonnes = Math.max(0.4, currentTotalTonnes - savingsTonnes);

        // Update headers & summaries
        if (hdrCurrentVal) hdrCurrentVal.textContent = `${currentTotalTonnes.toFixed(2)} t`;
        if (hdrReductionVal) hdrReductionVal.textContent = `${savingsTonnes.toFixed(2)} t`;
        if (lblTotalFootprint) lblTotalFootprint.textContent = currentTotalTonnes.toFixed(2);
        if (lblProjectedFootprint) lblProjectedFootprint.textContent = `${projectedTotalTonnes.toFixed(2)} t`;

        // Footprint target bar comparing with sustainable target (2.0t)
        if (barCompare && pctDiff) {
            // Set 10 tonnes as the visual 100% capacity limit of the bar
            const fillPct = Math.min(100, (currentTotalTonnes / 10) * 100);
            barCompare.style.width = `${fillPct}%`;

            const diff = ((currentTotalTonnes - 2.0) / 2.0) * 100;
            if (diff > 0) {
                pctDiff.textContent = `+${diff.toFixed(0)}% above IPCC target`;
                pctDiff.className = 'text-amber';
                barCompare.style.background = 'linear-gradient(90deg, #10b981 0%, #f59e0b 60%, #ef4444 100%)';
            } else {
                pctDiff.textContent = `${Math.abs(diff).toFixed(0)}% below IPCC target`;
                pctDiff.className = 'text-emerald';
                barCompare.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
            }
        }

        // Commitments targets and milestones text

        if (lblCommitmentPercentage && barCommitmentProgress && lblCommitmentStatus) {
            // Carbon offset progress calculation: how much did we cut to reach target?
            const carbonNeedsCutting = Math.max(0, currentTotalTonnes - 2.0);
            
            if (carbonNeedsCutting === 0) {
                lblCommitmentPercentage.textContent = 'Sustainable!';
                barCommitmentProgress.style.width = '100%';
                lblCommitmentStatus.textContent = 'Excellent! Your footprint is already sustainable at under 2.0 tonnes.';
            } else {
                const targetMetPct = Math.min(100, (savingsTonnes / carbonNeedsCutting) * 100);
                lblCommitmentPercentage.textContent = `${targetMetPct.toFixed(0)}% of target reduction met`;
                barCommitmentProgress.style.width = `${targetMetPct}%`;

                if (targetMetPct === 0) {
                    lblCommitmentStatus.textContent = "You haven't committed to any reduction actions yet. Visit the Action Planner to start!";
                } else if (targetMetPct < 100) {
                    const remaining = carbonNeedsCutting - savingsTonnes;
                    lblCommitmentStatus.textContent = `Great start! You need to commit to cut another ${remaining.toFixed(2)} tonnes to hit the IPCC target.`;
                } else {
                    lblCommitmentStatus.textContent = "Congratulations! Your active commitments will reduce your carbon footprint to the safety target!";
                }
            }
        }

        // Advice generator text
        if (lblDynamicTip) {
            // Find highest emission category
            const cats = [
                { name: 'Transport', value: emissions.transport },
                { name: 'Home Energy', value: emissions.energy },
                { name: 'Diet', value: emissions.diet },
                { name: 'Lifestyle', value: emissions.lifestyle }
            ];
            cats.sort((a, b) => b.value - a.value);

            let tip = '';
            if (cats[0].name === 'Transport') {
                if (state.inputs.flights > 15) {
                    tip = '✈️ <strong>Flights are your primary impact</strong>. Consider virtual business options or substituting short-haul flights with rail travel.';
                } else {
                    tip = '🚗 <strong>Road travel is driving up emissions</strong>. Consider choosing electric/hybrid vehicles, carpooling, or swapping a few car trips for biking.';
                }
            } else if (cats[0].name === 'Home Energy') {
                if (state.inputs.cleanEnergy < 40) {
                    tip = '🔌 <strong>Grid electricity is carbon heavy</strong>. Try sourcing renewable electricity programs, checking insulation, or installing solar panels.';
                } else {
                    tip = '🔥 <strong>Heating accounts for your largest energy use</strong>. Lowering your thermostat by just 1-2°C during winter months saves hundreds of kg of CO₂.';
                }
            } else if (cats[0].name === 'Diet') {
                tip = '🥩 <strong>Meat diet carries high emissions</strong>. Cutting red meat, adopting vegetarian/vegan meals, or purchasing locally sourced items will significantly decrease footprint.';
            } else {
                tip = '🛍️ <strong>Material goods carry high supply chain footprints</strong>. Consider extending electronics upgrades to 4+ years, buying secondhand clothes, and sorting recycling closely.';
            }
            setTipText(lblDynamicTip, tip);
        }

        // Update Chart visualizations
        updateCharts(emissions, currentTotalTonnes, projectedTotalTonnes);

        // Update Simulator outputs
        updateSimulator(currentTotalTonnes);

        // Check and update gamification status
        checkBadges(currentTotalTonnes, projectedTotalTonnes);
    }

    // -------------------------------------------------------------
    // 12. INITIAL SETUP RUN
    // -------------------------------------------------------------
    syncStateToDOM();
    recalculateAll();
    renderActionPlanner();

});

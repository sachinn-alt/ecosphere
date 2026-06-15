/**
 * @jest-environment jsdom
 */
// DOM integration test suite for app.js
const fs = require('fs');
const path = require('path');

describe('EcoSphere DOM and tab switching tests', () => {
    
    beforeAll(() => {
        // Load index.html content
        const htmlPath = path.resolve(__dirname, 'index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Mock Canvas context to prevent Chart.js exceptions in JSDOM
        HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
            fillRect: jest.fn(),
            clearRect: jest.fn(),
            getImageData: jest.fn(),
            putImageData: jest.fn(),
            createImageData: jest.fn(),
            setTransform: jest.fn(),
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            stroke: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn(),
            fill: jest.fn(),
            rect: jest.fn(),
            clip: jest.fn(),
            closePath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            grid: jest.fn()
        }));

        // Set up JSDOM body
        document.body.innerHTML = html;

        // Mock window.scrollTo to prevent JSDOM unimplemented error
        window.scrollTo = jest.fn();

        // Mock window.confirm to bypass default alert prompt dialogs in JSDOM
        window.confirm = jest.fn(() => true);

        // Mock Chart.js in global scope
        global.Chart = jest.fn().mockImplementation(() => ({
            update: jest.fn(),
            data: { datasets: [{ data: [] }] }
        }));

        // Mock calculateEmissions in global scope
        global.calculateEmissions = require('./emissionsCalculator').calculateEmissions;

        // Load app.js and dispatch DOMContentLoaded
        require('./app');
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    test('Initializes dashboard text and structures correctly', () => {
        const title = document.getElementById('main-heading');
        expect(title.textContent).toBe('Environmental Dashboard');

        const currentVal = document.getElementById('hdr-current-val');
        // Initial defaults calculation gives 10.24 tonnes
        expect(currentVal.textContent).toBe('10.24 t');
    });

    test('Navigates between tabs on nav clicks', () => {
        const calcTabBtn = document.getElementById('nav-btn-calculator');
        const calcTabPane = document.getElementById('calculator-tab');
        const dashboardPane = document.getElementById('dashboard-tab');

        // Click calculator tab button
        calcTabBtn.dispatchEvent(new Event('click'));

        // Pane visibility checks
        expect(calcTabPane.classList.contains('active')).toBe(true);
        expect(dashboardPane.classList.contains('active')).toBe(false);
    });

    test('Calculator step next and previous triggers work', () => {
        const nextBtn = document.getElementById('btn-calc-next');
        const step1Pane = document.getElementById('calc-step-pane-1');
        const step2Pane = document.getElementById('calc-step-pane-2');

        expect(step1Pane.classList.contains('active')).toBe(true);
        expect(step2Pane.classList.contains('active')).toBe(false);

        // Click next button to navigate to Home Energy step
        nextBtn.dispatchEvent(new Event('click'));

        // Step 2 should be active now
        expect(step1Pane.classList.contains('active')).toBe(false);
        expect(step2Pane.classList.contains('active')).toBe(true);
    });

    test('Action Planner commits update reduction metrics', () => {
        const resetBtn = document.getElementById('btn-reset-data');
        // Click reset first to clear previous states and ensure clean test conditions
        resetBtn.dispatchEvent(new Event('click'));
        
        // Find first commit button
        const commitButtons = document.querySelectorAll('.btn-commit');
        expect(commitButtons.length).toBeGreaterThan(0);
        
        const firstCommitBtn = commitButtons[0];
        expect(firstCommitBtn.textContent).toBe('Commit');
        
        // Commit to the first action (impact is 150 kg = 0.15 tonnes)
        firstCommitBtn.dispatchEvent(new Event('click'));
        
        const reductionVal = document.getElementById('hdr-reduction-val');
        expect(reductionVal.textContent).toBe('0.15 t');
        
        // Re-query the button from DOM since the list was re-rendered and updated
        const updatedCommitButtons = document.querySelectorAll('.btn-commit');
        expect(updatedCommitButtons[0].textContent).toBe('Committed');
    });

    test('Simulator adoption updates planetary feedback', () => {
        jest.useFakeTimers();
        const adoptionSlider = document.getElementById('range-sim-adoption');
        const simTemp = document.getElementById('sim-temp-val');
        
        // Simulate dragging slider to 0% adoption
        adoptionSlider.value = 0;
        adoptionSlider.dispatchEvent(new Event('input'));
        
        // Fast-forward debounce timers (100ms)
        jest.runAllTimers();
        
        // With 0% adoption, temperature rise should drop towards stable target of +1.5°C
        expect(simTemp.textContent).toContain('+1.5°C');
        jest.useRealTimers();
    });
});

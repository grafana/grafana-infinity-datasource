// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';

// Mock canvas context for Combobox component
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  measureText: jest.fn(() => ({ width: 100 })),
})) as any;

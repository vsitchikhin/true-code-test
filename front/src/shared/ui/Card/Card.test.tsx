import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card component', () => {
  it('renders children correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies correct padding class', () => {
    render(<Card padding="lg">Content</Card>);
    expect(screen.getByText('Content')).toHaveClass(/p-lg/);
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { StringArrayInput } from '@/components/extended/StringArrayInput';

describe('StringArrayInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without error', () => {
    const result = render(<StringArrayInput value={[]} onChange={mockOnChange} />);
    expect(result.container.firstChild).not.toBeNull();
  });

  it('should render an input for each value', () => {
    render(<StringArrayInput value={['https://foo.com', 'https://bar.com']} onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('https://foo.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://bar.com')).toBeInTheDocument();
  });

  it('should render the placeholder on each input', () => {
    render(<StringArrayInput value={['', '']} onChange={mockOnChange} placeholder="Enter a URL" />);
    const inputs = screen.getAllByPlaceholderText('Enter a URL');
    expect(inputs).toHaveLength(2);
  });

  it('should render default add button text', () => {
    render(<StringArrayInput value={[]} onChange={mockOnChange} />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should render custom add button text', () => {
    render(<StringArrayInput value={[]} onChange={mockOnChange} addButtonText="Add host" />);
    expect(screen.getByText('Add host')).toBeInTheDocument();
  });

  it('should call onChange with a new empty string appended when add button is clicked', async () => {
    render(<StringArrayInput value={['https://foo.com']} onChange={mockOnChange} />);
    await userEvent.click(screen.getByText('Add'));
    expect(mockOnChange).toHaveBeenCalledWith(['https://foo.com', '']);
  });

  it('should call onChange with empty array plus empty string when value is empty and add is clicked', async () => {
    render(<StringArrayInput value={[]} onChange={mockOnChange} />);
    await userEvent.click(screen.getByText('Add'));
    expect(mockOnChange).toHaveBeenCalledWith(['']);
  });

  it('should call onChange with updated value when an input is changed', async () => {
    render(<StringArrayInput value={['https://foo.com', 'https://bar.com']} onChange={mockOnChange} />);
    const input = screen.getByDisplayValue('https://foo.com');
    await userEvent.type(input, 'x');
    expect(mockOnChange).toHaveBeenCalledWith(['https://foo.comx', 'https://bar.com']);
  });

  it('should call onChange with item removed when remove button is clicked', async () => {
    render(<StringArrayInput value={['https://foo.com', 'https://bar.com', 'https://baz.com']} onChange={mockOnChange} />);
    const removeButtons = screen.getAllByLabelText('Remove item');
    expect(removeButtons).toHaveLength(3);
    // Remove the second item
    await userEvent.click(removeButtons[1]);
    expect(mockOnChange).toHaveBeenCalledWith(['https://foo.com', 'https://baz.com']);
  });

  it('should call onChange with empty array when the only item is removed', async () => {
    render(<StringArrayInput value={['https://foo.com']} onChange={mockOnChange} />);
    await userEvent.click(screen.getByLabelText('Remove item'));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('should render a remove button for each item', () => {
    render(<StringArrayInput value={['a', 'b', 'c']} onChange={mockOnChange} />);
    expect(screen.getAllByLabelText('Remove item')).toHaveLength(3);
  });

  it('should not render any remove buttons when value is empty', () => {
    render(<StringArrayInput value={[]} onChange={mockOnChange} />);
    expect(screen.queryAllByLabelText('Remove item')).toHaveLength(0);
  });
});

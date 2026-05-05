import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Button } from '../../components/ui/Button'

test('calls onPress when tapped', () => {
  const fn = jest.fn()
  const { getByText } = render(<Button label="Save" onPress={fn} />)
  fireEvent.press(getByText('Save'))
  expect(fn).toHaveBeenCalledTimes(1)
})

test('does not call onPress when disabled', () => {
  const fn = jest.fn()
  const { getByText } = render(<Button label="Save" onPress={fn} disabled />)
  fireEvent.press(getByText('Save'))
  expect(fn).not.toHaveBeenCalled()
})

test('shows activity indicator when loading', () => {
  const { getByTestId } = render(<Button label="Save" onPress={() => {}} loading />)
  expect(getByTestId('btn-loading')).toBeTruthy()
})

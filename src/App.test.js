import { render, screen } from "@testing-library/react";
import App from "./App";

test("renderiza título principal", () => {
  render(<App />);
  const titleElement = screen.getByText(/Mi Closet Smart/i);
  expect(titleElement).toBeInTheDocument();
});

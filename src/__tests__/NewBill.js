/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

// Mocking localStorage
const localStorageMock = {
  getItem: jest.fn((key) => {
    if (key === "user") {
      return JSON.stringify({ email: "test@example.com" });
    }
    return null;
  }),
};

const createMock = jest.fn(() => Promise.resolve({ fileUrl: "http://example.com/file.jpg", key: "bill123" }));
const updateMock = jest.fn(() => Promise.resolve());

const storeMock = {
  bills: jest.fn(() => ({
    create: createMock,
    update: updateMock,
  })),
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mocking the localStorage global variable
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });

      // Mocking the alert function
      window.alert = jest.fn();

      new NewBill({ document, onNavigate: jest.fn(), store: storeMock, localStorage });
    });

    test("Then the form should be rendered", () => {
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });

    test("Then I can upload a valid file", async () => {
      const fileInput = screen.getByTestId("file");
      const validFile = new File(["file contents"], "photo.jpg", { type: "image/jpeg" });

      // Simulate file upload
      await fireEvent.change(fileInput, { target: { files: [validFile] } });

      // Debugging log to check if the file was accepted
      console.log(createMock.mock.calls.length);  // Log the number of calls to the create mock
      expect(createMock).toHaveBeenCalled(); // Check if create was called
      expect(localStorageMock.getItem).toHaveBeenCalled(); // Check if localStorage was accessed
    });

    test("Then I can't upload an invalid file", async () => {
      const fileInput = screen.getByTestId("file");
      const invalidFile = new File(["file contents"], "photo.txt", { type: "text/plain" });

      // Simulate file upload
      await fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(fileInput.value).toBe(""); // File input should be reset
      expect(window.alert).toHaveBeenCalledWith('Veuillez sélectionner un fichier au format jpg, jpeg ou png.'); // Check alert
    });

    test("Then I can submit the form with valid data", async () => {
      const form = screen.getByTestId("form-new-bill");
      const validFile = new File(["file contents"], "photo.jpg", { type: "image/jpeg" });

      // Simulate file upload first
      await fireEvent.change(screen.getByTestId("file"), { target: { files: [validFile] } });

      // Fill out the form fields
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Services" } });
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Test Service" } });
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-10-15" } });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Test commentary" } });

      // Simulate form submission
      await fireEvent.submit(form);

      // Debugging log to check if the update mock was called
      console.log(updateMock.mock.calls.length);  // Log the number of calls to the update mock
      expect(updateMock).toHaveBeenCalled(); // Check that updateBill was called
    });
  });
});


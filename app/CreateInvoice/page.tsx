"use client";
import { useState } from "react";

export default function index(): JSX.Element {
  const [invoiceDetails, setInvoiceDetails] = useState({
    recipient: "",
    amount: "",
    description: "",
  });
  const [status, setStatus] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Creating invoice...");

    // Simulate invoice creation (you can replace this with blockchain integration)
    setTimeout(() => {
      setStatus("Invoice created successfully!");
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Create Invoice</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-lg p-6"
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="recipient">
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            name="recipient"
            value={invoiceDetails.recipient}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter recipient wallet address"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="amount">
            Amount (in crypto)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={invoiceDetails.amount}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={invoiceDetails.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter invoice description"
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Create Invoice
        </button>
      </form>

      {status && <p className="mt-4 text-lg text-center">{status}</p>}
    </div>
  );
}
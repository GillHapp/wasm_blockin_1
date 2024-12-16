"use client";

import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useModal,
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CONTRACTS, TREASURY, POTATO_ID } from "./utils/constants";
import type { ExecuteResult } from "@cosmjs/cosmwasm-stargate";

type InvoiceDetails = {
  recipient: string;
  amount: string;
  description: string;
  payer: string;
  dueDate: string;
  items: Array<{ itemName: string; itemPrice: string }>;
};

type ExecuteMsg = {
  CreateInvoice: {  // Change this to "CreateInvoice" (capitalized)
    recipient: string;
    amount: string;
    description: string;
    due_date: number;
  };
};

async function write(
  client: any,
  msg: unknown,
  sender: string,
  contract: string
): Promise<ExecuteResult | undefined> {
  if (!client) throw new Error("Client not initialized.");
  return client.execute(
    sender,
    contract,
    msg,
    "auto",
    "",
    [],
  );
}

export default function Page(): JSX.Element {
  const router = useRouter();
  const { data: { bech32Address } = {}, isConnected } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const [, setShow] = useModal();

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    recipient: "",
    amount: "",
    description: "",
    payer: "",
    dueDate: "",
    items: [{ itemName: "", itemPrice: "" }],
  });
  const [status, setStatus] = useState<string | undefined>();
  const [invoicePdfUrl, setInvoicePdfUrl] = useState<string | undefined>();


  useEffect(() => {
    if (isConnected && bech32Address) {
      router.push(`/?address=${bech32Address}`);
    }
  }, [isConnected, bech32Address, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInvoiceDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceDetails["items"][number],
    value: string
  ) => {
    setInvoiceDetails((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleAddItem = () => {
    setInvoiceDetails((prev) => ({
      ...prev,
      items: [...prev.items, { itemName: "", itemPrice: "" }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceDetails((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  function isValidBech32(address: string): boolean {
    // Check if the address is a valid bech32 address
    const regex = /^[a-z0-9]+$/;  // Matches lowercase alphanumeric addresses
    return regex.test(address);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Creating invoice...");

    try {
      if (!client || !bech32Address) throw new Error("Client or address missing.");

      // Validate addresses
      if (!isValidBech32(invoiceDetails.recipient) || !isValidBech32(invoiceDetails.payer)) {
        throw new Error("Invalid address format");
      }

      const totalAmount = invoiceDetails.items.reduce((sum, item) => {
        const price = parseFloat(item.itemPrice);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);

      const msg: ExecuteMsg = {
        CreateInvoice: {
          recipient: invoiceDetails.recipient.toLowerCase(),  // Ensure it is lowercase
          amount: totalAmount.toString(),
          description: invoiceDetails.description,
          due_date: new Date(invoiceDetails.dueDate).getTime(),
        },
      };
      await write(client, msg, bech32Address, CONTRACTS.Invoice);
      setStatus("Invoice created successfully!");
      setInvoicePdfUrl("https://example.com/invoice.pdf"); // Update with real URL
    } catch (error) {
      console.error("Error creating invoice:", error);
      setStatus("Failed to create invoice.");
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {bech32Address && (
        <div className="text-lg mb-4">
          Connected Wallet: {bech32Address}
        </div>
      )}

      {!isConnected && (
        <Button onClick={() => setShow(true)}>Connect Wallet</Button>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Create Invoice</h1>

        <input
          type="text"
          name="payer"
          placeholder="Payer Address"
          value={invoiceDetails.payer}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mb-4"
          required
        />
        <input
          type="text"
          name="recipient"
          placeholder="Recipient Address"
          value={invoiceDetails.recipient}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mb-4"
          required
        />
        <input
          type="date"
          name="dueDate"
          value={invoiceDetails.dueDate}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mb-4"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={invoiceDetails.description}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mb-4"
        ></textarea>

        <div>
          {invoiceDetails.items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder={`Item ${index + 1}`}
                value={item.itemName}
                onChange={(e) =>
                  handleItemChange(index, "itemName", e.target.value)
                }
                className="border rounded flex-1 p-2"
              />
              <input
                type="number"
                placeholder="Price"
                value={item.itemPrice}
                onChange={(e) =>
                  handleItemChange(index, "itemPrice", e.target.value)
                }
                className="border rounded flex-1 p-2"
              />
              {invoiceDetails.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-gray-300 rounded p-2"
          >
            Add Item
          </button>
        </div>

        <p className="mt-4 font-semibold">
          Total Amount: $
          {invoiceDetails.items.reduce(
            (sum, item) => sum + parseFloat(item.itemPrice || "0"),
            0
          )}
        </p>

        <button type="submit" className="mx-20 bg-blue-900 text-black h-2 rounded mt-4"
        >
          Submit
        </button>
      </form>

      {status && <p className="mt-4">{status}</p>}
      {invoicePdfUrl && (
        <a href={invoicePdfUrl} download className="mt-4">
          Download Invoice
        </a>
      )}
    </div>
  );
}

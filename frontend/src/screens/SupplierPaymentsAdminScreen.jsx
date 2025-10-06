import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaPlus } from "react-icons/fa";
import {
  useGetAllSupplierPaymentsQuery,
  useAddSupplierPaymentMutation,
  useUpdateSupplierPaymentMutation,
} from "../slices/supplierPaymentApiSlice";
import { useGetAllPurchaseOrdersQuery } from "../slices/purchaseOrderApiSlice";

export default function SupplierPaymentsAdminScreen() {
  const { data: paymentsData, isLoading, error, refetch } = useGetAllSupplierPaymentsQuery();
  const { data: ordersData } = useGetAllPurchaseOrdersQuery();

  const [addPayment, { isLoading: adding }] = useAddSupplierPaymentMutation();
  const [updatePayment, { isLoading: updating }] = useUpdateSupplierPaymentMutation();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    purchaseOrderID: "",
    totalAmount: 0,
    givenAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paymentStatus: "Unpaid",
    paymentMethod: "",
    paymentDate: "",
    paidBy: "",
  });

  const resetForm = () => {
    setFormData({
      purchaseOrderID: "",
      totalAmount: 0,
      givenAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      paymentStatus: "Unpaid",
      paymentMethod: "",
      paymentDate: "",
      paidBy: "",
    });
    setSelectedPayment(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "givenAmount") {
      const given = Number(value);
      const existingPaid = selectedPayment?.paidAmount || 0;
      const totalAmount = formData.totalAmount;

      if (given > totalAmount - existingPaid) {
        toast.error("Given amount cannot exceed remaining unpaid amount");
        return;
      }

      const newPaidAmount = existingPaid + given;
      const newUnpaidAmount = totalAmount - newPaidAmount;

      let newPaymentStatus = "Partial";
      if (newPaidAmount === 0) newPaymentStatus = "Unpaid";
      else if (newPaidAmount >= totalAmount) newPaymentStatus = "Paid";

      setFormData({
        ...formData,
        givenAmount: given,
        paidAmount: newPaidAmount,
        unpaidAmount: newUnpaidAmount,
        paymentStatus: newPaymentStatus,
      });
    } else if (name === "purchaseOrderID") {
      const order = ordersData?.orders.find((o) => o._id === value);
      if (!order) return;

      setFormData({
        ...formData,
        purchaseOrderID: value,
        totalAmount: order.totalAmount,
        givenAmount: 0,
        paidAmount: 0,
        unpaidAmount: order.totalAmount,
        paymentStatus: "Unpaid",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditClick = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      purchaseOrderID: payment.purchaseOrderID._id,
      totalAmount: payment.totalAmount,
      givenAmount: 0,
      paidAmount: payment.paidAmount,
      unpaidAmount: payment.totalAmount - payment.paidAmount,
      paymentStatus: payment.paymentStatus,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate?.split("T")[0] || "",
      paidBy: payment.paidBy,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.purchaseOrderID) return toast.error("Purchase order is required");
    if (!formData.paymentMethod) return toast.error("Payment method is required");

    try {
      if (selectedPayment) {
        if (selectedPayment.paidAmount >= selectedPayment.totalAmount) {
          return toast.error("Cannot update a fully paid payment");
        }

        await updatePayment({
          id: selectedPayment._id,
          purchaseOrderID: selectedPayment.purchaseOrderID._id,
          paymentMethod: formData.paymentMethod,
          givenAmount: formData.givenAmount,
          paidAmount: formData.paidAmount,
          unpaidAmount: formData.unpaidAmount,
          paymentStatus: formData.paymentStatus,
          paymentDate: formData.paymentDate,
          paidBy: formData.paidBy,
        }).unwrap();

        toast.success("Supplier payment updated");
      } else {
        await addPayment({
          purchaseOrderID: formData.purchaseOrderID,
          paymentMethod: formData.paymentMethod,
          givenAmount: formData.givenAmount,
          paymentDate: formData.paymentDate,
          paidBy: formData.paidBy,
        }).unwrap();

        toast.success("Supplier payment added");
      }

      resetForm();
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save payment");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Supplier Payments</h2>

      {isLoading ? (
        <p>Loading supplier payments...</p>
      ) : error ? (
        <p className="text-red-500">Error loading payments</p>
      ) : (
        <>
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border">Purchase Order</th>
                <th className="py-2 px-4 border">Payment Status</th>
                <th className="py-2 px-4 border">Payment Method</th>
                <th className="py-2 px-4 border">Paid Amount</th>
                <th className="py-2 px-4 border">Unpaid Amount</th>
                <th className="py-2 px-4 border">Total Amount</th>
                <th className="py-2 px-4 border">Payment Date</th>
                <th className="py-2 px-4 border">Paid By</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentsData?.payments?.map((payment) => (
                <tr key={payment._id} className="text-center border-b">
                  <td className="py-2 px-4">{payment.purchaseOrderID._id}</td>
                  <td className="py-2 px-4">{payment.paymentStatus}</td>
                  <td className="py-2 px-4">{payment.paymentMethod}</td>
                  <td className="py-2 px-4">{payment.paidAmount}</td>
                  <td className="py-2 px-4">{payment.unpaidAmount}</td>
                  <td className="py-2 px-4">{payment.totalAmount}</td>
                  <td className="py-2 px-4">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{payment.paidBy}</td>
                  <td className="py-2 px-4">
                    {payment.paidAmount < payment.totalAmount && (
                      <button
                        onClick={() => handleEditClick(payment)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
          >
            <FaPlus />
          </button>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {selectedPayment ? "Update Payment" : "Add Payment"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Purchase Order */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Purchase Order</label>
                <select
                  name="purchaseOrderID"
                  value={formData.purchaseOrderID}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  disabled={!!selectedPayment}
                >
                  <option value="">Select Purchase Order</option>
                  {ordersData?.orders
                    ?.filter(
                      (order) =>
                        !paymentsData?.payments?.some(
                          (p) => p.purchaseOrderID._id === order._id
                        )
                    )
                    .map((order) => (
                      <option key={order._id} value={order._id}>
                        {`${order._id} - Supplier: ${order.supplierID?.fullName || order.supplierID}`}
                      </option>
                    ))}
                </select>
              </div>

              {/* Payment Method */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Payment Method</label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              {/* Total Amount */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Total Amount</label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>

              {/* Given Amount */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Given Amount</label>
                <input
                  type="number"
                  name="givenAmount"
                  value={formData.givenAmount}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              {/* Paid Amount */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Paid Amount</label>
                <input
                  type="number"
                  value={formData.paidAmount}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>

              {/* Unpaid Amount */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Unpaid Amount</label>
                <input
                  type="number"
                  value={formData.unpaidAmount}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>

              {/* Payment Status */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Payment Status</label>
                <input
                  type="text"
                  value={formData.paymentStatus}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>

              {/* Payment Date */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              {/* Paid By */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Paid By</label>
                <input
                  type="text"
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || updating}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {adding || updating ? "Saving..." : selectedPayment ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  FiX,
  FiCheck,
  FiPrinter,
  FiUser,
  FiPackage,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

const ProcessPickupModal = ({ order, isOpen, onClose, onOrderProcessed }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    claimCode: { verified: false, checking: false },
    membershipId: { verified: false, checking: false },
  });
  const [membershipId, setMembershipId] = useState("");
  const [claimCode, setClaimCode] = useState(order?.claimCode || "");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset form when order changes
  useEffect(() => {
    if (order) {
      setClaimCode(order.claimCode || "");
      setMembershipId("");
      setVerificationStatus({
        claimCode: { verified: false, checking: false },
        membershipId: { verified: false, checking: false },
      });
      setShowConfirmation(false);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  // Verify claim code
  const verifyClaimCode = async () => {
    if (!claimCode.trim()) {
      showToast({
        type: "error",
        message: "Please enter a claim code",
      });
      return;
    }

    setVerificationStatus((prev) => ({
      ...prev,
      claimCode: { ...prev.claimCode, checking: true },
    }));

    try {
      // In production, replace with actual API call
      // const response = await api.post("/api/Orders/VerifyClaimCode", { claimCode });

      // Mock API response
      await new Promise((resolve) => setTimeout(resolve, 800));
      const isValid = claimCode === order.claimCode;

      setVerificationStatus((prev) => ({
        ...prev,
        claimCode: { checking: false, verified: isValid },
      }));

      if (!isValid) {
        showToast({
          type: "error",
          message: "Invalid claim code",
        });
      }
    } catch (error) {
      console.error("Error verifying claim code:", error);
      showToast({
        type: "error",
        message: "Failed to verify claim code",
      });
      setVerificationStatus((prev) => ({
        ...prev,
        claimCode: { checking: false, verified: false },
      }));
    }
  };

  // Verify membership ID
  const verifyMembershipId = async () => {
    if (!membershipId.trim()) {
      showToast({
        type: "error",
        message: "Please enter a membership ID",
      });
      return;
    }

    setVerificationStatus((prev) => ({
      ...prev,
      membershipId: { ...prev.membershipId, checking: true },
    }));

    try {
      // In production, replace with actual API call
      // const response = await api.post("/api/Members/VerifyMembershipId", {
      //   memberId: membershipId,
      //   orderId: order.id
      // });

      // Mock API response
      await new Promise((resolve) => setTimeout(resolve, 800));
      const isValid = membershipId === order.customer?.membershipId;

      setVerificationStatus((prev) => ({
        ...prev,
        membershipId: { checking: false, verified: isValid },
      }));

      if (!isValid) {
        showToast({
          type: "error",
          message: "Invalid membership ID for this order",
        });
      }
    } catch (error) {
      console.error("Error verifying membership ID:", error);
      showToast({
        type: "error",
        message: "Failed to verify membership ID",
      });
      setVerificationStatus((prev) => ({
        ...prev,
        membershipId: { checking: false, verified: false },
      }));
    }
  };

  // Process order pickup
  const processPickup = async () => {
    if (
      !verificationStatus.claimCode.verified ||
      !verificationStatus.membershipId.verified
    ) {
      showToast({
        type: "error",
        message: "Please verify both claim code and membership ID",
      });
      return;
    }

    setLoading(true);

    try {
      // In production, replace with actual API call
      // const response = await api.post(`/api/Orders/${order.id}/ProcessPickup`, {
      //   claimCode,
      //   membershipId
      // });

      // Mock API response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast({
        type: "success",
        message: "Order pickup processed successfully",
        title: "Success",
      });

      // Show confirmation view
      setShowConfirmation(true);

      // Call the parent callback
      if (onOrderProcessed) {
        onOrderProcessed({
          ...order,
          status: "Fulfilled",
          pickedUpAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error processing pickup:", error);
      showToast({
        type: "error",
        message: "Failed to process order pickup",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Print receipt
  const printReceipt = () => {
    // In a real application, this would generate and print a receipt
    // For now, just mock the behavior
    showToast({
      type: "info",
      message: "Printing receipt...",
    });

    // Mock print dialog - in production, replace with actual print functionality
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const isReadyForPickup = order.status === "Ready for Pickup";
  const isAllVerified =
    verificationStatus.claimCode.verified &&
    verificationStatus.membershipId.verified;

  // Confirmation view after successful processing
  if (showConfirmation) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          ></div>
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <div className="inline-block align-bottom bg-[var(--surface)] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-[var(--surface)] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-success-100 dark:bg-success-900 sm:mx-0 sm:h-10 sm:w-10">
                  <FiCheck className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3
                    className="text-lg leading-6 font-medium text-[var(--text-primary)]"
                    id="modal-title"
                  >
                    Order Pickup Completed
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-[var(--text-secondary)]">
                      The order has been successfully fulfilled and the books
                      have been handed over to the customer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 border-t border-[var(--border)] pt-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Processed on {new Date().toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={printReceipt}
                      className="inline-flex items-center px-3 py-2 border border-[var(--border)] rounded-md shadow-sm text-sm font-medium text-[var(--text-primary)] bg-[var(--surface)] hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none"
                    >
                      <FiPrinter className="mr-2 -ml-1 h-5 w-5" />
                      Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[var(--surface)] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-[var(--border)]">
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[var(--surface)] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-[var(--surface)] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
                <FiPackage className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className="text-lg leading-6 font-medium text-[var(--text-primary)]"
                  id="modal-title"
                >
                  Process Order Pickup
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Verify customer information and complete the order pickup
                    process.
                  </p>
                </div>
              </div>
            </div>

            {!isReadyForPickup && (
              <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/30 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-warning-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                      Order Status Warning
                    </h3>
                    <div className="mt-2 text-sm text-warning-700 dark:text-warning-300">
                      <p>
                        This order is currently in "{order.status}" status, not
                        "Ready for Pickup". Processing this order might cause
                        inconsistencies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-4">
              {/* Order Details */}
              <div className="border border-[var(--border)] rounded-md overflow-hidden">
                <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-[var(--text-primary)]">
                  Order Details
                </div>
                <div className="p-4 text-sm text-[var(--text-secondary)]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Order #
                      </p>
                      <p className="font-medium text-[var(--text-primary)]">
                        {order.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Date
                      </p>
                      <p className="font-medium text-[var(--text-primary)]">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          order.status === "Ready for Pickup"
                            ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200"
                            : "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Total Amount
                      </p>
                      <p className="font-medium text-[var(--text-primary)]">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Customer
                    </p>
                    <p className="font-medium text-[var(--text-primary)]">
                      {order.customer?.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {order.customer?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Books in Order */}
              <div className="border border-[var(--border)] rounded-md overflow-hidden">
                <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-[var(--text-primary)]">
                  Books ({order.items?.length || 0})
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {item.title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {item.author} • {item.format}
                        </p>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Fields */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="claimCode"
                    className="block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Claim Code Verification
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="claimCode"
                      id="claimCode"
                      value={claimCode}
                      onChange={(e) => setClaimCode(e.target.value)}
                      className={`flex-1 min-w-0 px-3 py-2 rounded-l-md focus:ring-primary-500 focus:border-primary-500 block w-full border ${
                        verificationStatus.claimCode.verified
                          ? "border-success-500 bg-success-50 dark:bg-success-900/20"
                          : "border-[var(--border)] bg-[var(--surface)]"
                      } text-[var(--text-primary)]`}
                      placeholder="Enter claim code"
                      disabled={
                        verificationStatus.claimCode.verified ||
                        verificationStatus.claimCode.checking
                      }
                    />
                    <button
                      type="button"
                      onClick={verifyClaimCode}
                      disabled={
                        verificationStatus.claimCode.verified ||
                        verificationStatus.claimCode.checking
                      }
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md ${
                        verificationStatus.claimCode.verified
                          ? "bg-success-500 hover:bg-success-600 text-white"
                          : "bg-primary-600 hover:bg-primary-700 text-white"
                      } focus:outline-none`}
                    >
                      {verificationStatus.claimCode.verified ? (
                        <>
                          <FiCheck className="mr-2 -ml-1 h-5 w-5" /> Verified
                        </>
                      ) : verificationStatus.claimCode.checking ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>{" "}
                          Verifying
                        </>
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                  {verificationStatus.claimCode.verified && (
                    <p className="mt-1 text-sm text-success-600 dark:text-success-400">
                      Claim code verified successfully.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="membershipId"
                    className="block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Membership ID Verification
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-[var(--text-secondary)]" />
                      </div>
                      <input
                        type="text"
                        name="membershipId"
                        id="membershipId"
                        value={membershipId}
                        onChange={(e) => setMembershipId(e.target.value)}
                        className={`focus:ring-primary-500 focus:border-primary-500 block w-full rounded-l-md pl-10 border ${
                          verificationStatus.membershipId.verified
                            ? "border-success-500 bg-success-50 dark:bg-success-900/20"
                            : "border-[var(--border)] bg-[var(--surface)]"
                        } text-[var(--text-primary)]`}
                        placeholder="Enter membership ID"
                        disabled={
                          verificationStatus.membershipId.verified ||
                          verificationStatus.membershipId.checking
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={verifyMembershipId}
                      disabled={
                        verificationStatus.membershipId.verified ||
                        verificationStatus.membershipId.checking
                      }
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md ${
                        verificationStatus.membershipId.verified
                          ? "bg-success-500 hover:bg-success-600 text-white"
                          : "bg-primary-600 hover:bg-primary-700 text-white"
                      } focus:outline-none`}
                    >
                      {verificationStatus.membershipId.verified ? (
                        <>
                          <FiCheck className="mr-2 -ml-1 h-5 w-5" /> Verified
                        </>
                      ) : verificationStatus.membershipId.checking ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>{" "}
                          Verifying
                        </>
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                  {verificationStatus.membershipId.verified && (
                    <p className="mt-1 text-sm text-success-600 dark:text-success-400">
                      Membership ID verified successfully.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-[var(--border)]">
            <button
              type="button"
              onClick={processPickup}
              disabled={!isAllVerified || loading}
              className={`w-full inline-flex justify-center rounded-md shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                isAllVerified && !loading
                  ? "bg-success-600 hover:bg-success-700"
                  : "bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>{" "}
                  Processing
                </>
              ) : (
                "Complete Pickup"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-[var(--border)] shadow-sm px-4 py-2 bg-[var(--surface)] text-base font-medium text-[var(--text-primary)] hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessPickupModal;

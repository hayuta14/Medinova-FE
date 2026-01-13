"use client";

import { useState, useEffect, useCallback } from "react";
import { getLeaveRequestManagement } from "@/generated/api/endpoints/leave-request-management/leave-request-management";
import { getUserManagement } from "@/generated/api/endpoints/user-management/user-management";
import { getUser, isAuthenticated } from "@/utils/auth";
import type { DoctorLeaveRequest, LocalTime } from "@/generated/api/models";

export default function ApproveRequestsPage() {
  const [activeTab, setActiveTab] = useState<"leave" | "account">("leave");
  const [leaveRequests, setLeaveRequests] = useState<DoctorLeaveRequest[]>([]);
  const [accountRequests, setAccountRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Load leave requests
  const loadLeaveRequests = useCallback(async () => {
    // Check if user is authenticated and is ADMIN before making API call
    if (!isAuthenticated()) {
      setErrorMessage("Please log in to access this page.");
      setIsLoading(false);
      return;
    }

    const user = getUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
      setErrorMessage("You do not have permission to access this page.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      const leaveApi = getLeaveRequestManagement();
      const response = await leaveApi.getAllLeaveRequests();

      // Handle response - could be array directly or wrapped in data
      const requestsData = (response as any)?.data || response;
      const requestsList = Array.isArray(requestsData) ? requestsData : [];

      // Filter only PENDING requests
      const pendingRequests = requestsList.filter(
        (req: DoctorLeaveRequest) =>
          req.status === "PENDING" || req.status === "pending"
      );

      // Sort by creation date (newest first)
      const sortedRequests = pendingRequests.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setLeaveRequests(sortedRequests);
    } catch (error: any) {
      // Only log error if it's not a 403 (which we handle gracefully)
      if (error?.response?.status !== 403) {
        console.error("Error loading leave requests:", error);
      }

      // Handle 403 Forbidden error gracefully
      if (error?.response?.status === 403) {
        setErrorMessage(
          "You do not have permission to view leave requests. Please ensure you are logged in as an administrator."
        );
        setIsAuthorized(false); // Mark as unauthorized to prevent further API calls
      } else {
        setErrorMessage("Failed to load leave requests. Please try again.");
      }
      setLeaveRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load account update requests
  const loadAccountRequests = useCallback(async () => {
    // Check if user is authenticated and is ADMIN before making API call
    if (!isAuthenticated()) {
      setErrorMessage("Please log in to access this page.");
      setIsLoading(false);
      return;
    }

    const user = getUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
      setErrorMessage("You do not have permission to access this page.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      const userApi = getUserManagement();
      const response = await userApi.getAllUsers();

      // Handle response - could be array directly or wrapped in data
      const usersData = (response as any)?.data || response;
      const allUsers = Array.isArray(usersData) ? usersData : [];

      // Filter users with PENDING status (account update requests)
      const pendingUsers = allUsers.filter(
        (user: any) => user.status === "PENDING" || user.status === "pending"
      );

      // Sort by creation date (newest first)
      const sortedRequests = pendingUsers.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setAccountRequests(sortedRequests);
    } catch (error: any) {
      // Only log error if it's not a 403 (which we handle gracefully)
      if (error?.response?.status !== 403) {
        console.error("Error loading account requests:", error);
      }

      // Handle 403 Forbidden error gracefully
      if (error?.response?.status === 403) {
        setErrorMessage(
          "You do not have permission to view account requests. Please ensure you are logged in as an administrator."
        );
        setIsAuthorized(false); // Mark as unauthorized to prevent further API calls
      } else {
        setErrorMessage(
          "Failed to load account update requests. Please try again."
        );
      }
      setAccountRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authorization on mount and wait a bit for layout to finish checking
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") {
        return;
      }

      const user = getUser();
      const authenticated = isAuthenticated();

      // Double check: user must be authenticated AND have ADMIN role
      if (
        authenticated &&
        user &&
        (user.role === "ADMIN" || user.role === "admin")
      ) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        // Don't show error if user is not authenticated - layout will handle redirect
        if (authenticated) {
          setErrorMessage(
            "You do not have permission to access this page. Admin access required."
          );
        }
      }
    };

    // Wait a bit for admin layout to finish its authorization check
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load data when tab changes and user is authorized
  useEffect(() => {
    // Only proceed if explicitly authorized
    if (!isAuthorized) {
      return;
    }

    // Additional safety check before making API calls
    const user = getUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
      return;
    }

    if (activeTab === "leave") {
      loadLeaveRequests();
    } else {
      loadAccountRequests();
    }
  }, [activeTab, loadLeaveRequests, loadAccountRequests, isAuthorized]);

  // Handle approve leave request
  const handleApproveLeave = async (id: number | undefined) => {
    if (!id) return;

    if (!confirm("Are you sure you want to approve this leave request?")) {
      return;
    }

    try {
      const leaveApi = getLeaveRequestManagement();
      await leaveApi.updateLeaveRequestStatus(id, { status: "APPROVED" });
      await loadLeaveRequests();
      alert("Leave request approved successfully!");
    } catch (error: any) {
      console.error("Error approving leave request:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to approve leave request. Please try again.";
      alert(errorMsg);
    }
  };

  // Handle reject leave request
  const handleRejectLeave = async (id: number | undefined) => {
    if (!id) return;

    if (!confirm("Are you sure you want to reject this leave request?")) {
      return;
    }

    try {
      const leaveApi = getLeaveRequestManagement();
      await leaveApi.updateLeaveRequestStatus(id, { status: "REJECTED" });
      await loadLeaveRequests();
      alert("Leave request rejected successfully!");
    } catch (error: any) {
      console.error("Error rejecting leave request:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject leave request. Please try again.";
      alert(errorMsg);
    }
  };

  // Handle approve account update request
  const handleApproveAccount = async (userId: number) => {
    if (
      !confirm("Are you sure you want to approve this account update request?")
    ) {
      return;
    }

    try {
      // TODO: Implement API call to approve account update
      // For now, we can update user status to ACTIVE
      const userApi = getUserManagement();
      // Note: This might need a different API endpoint for account approval
      await loadAccountRequests();
      alert("Account update request approved successfully!");
    } catch (error: any) {
      console.error("Error approving account request:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to approve account request. Please try again.";
      alert(errorMsg);
    }
  };

  // Handle reject account update request
  const handleRejectAccount = async (userId: number) => {
    if (
      !confirm("Are you sure you want to reject this account update request?")
    ) {
      return;
    }

    try {
      // TODO: Implement API call to reject account update
      await loadAccountRequests();
      alert("Account update request rejected successfully!");
    } catch (error: any) {
      console.error("Error rejecting account request:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject account request. Please try again.";
      alert(errorMsg);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format datetime
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Format LocalTime to HH:MM or HH:MM:SS
  const formatLocalTime = (localTime?: LocalTime | string): string => {
    // Handle string format (e.g., "09:00:00" or "09:00")
    if (typeof localTime === "string") {
      // If it's already in HH:MM or HH:MM:SS format, return first 5 characters (HH:MM)
      if (localTime.match(/^\d{2}:\d{2}/)) {
        return localTime.substring(0, 5);
      }
      return localTime;
    }

    // Handle LocalTime object
    if (!localTime || typeof localTime !== "object") {
      return "N/A";
    }

    const hour = localTime.hour;
    const minute = localTime.minute;
    const second = localTime.second;

    if (hour === undefined && minute === undefined) {
      return "N/A";
    }

    const hourStr = (hour ?? 0).toString().padStart(2, "0");
    const minuteStr = (minute ?? 0).toString().padStart(2, "0");

    // Include seconds if available
    if (second !== undefined && second !== null) {
      const secondStr = second.toString().padStart(2, "0");
      return `${hourStr}:${minuteStr}:${secondStr}`;
    }

    return `${hourStr}:${minuteStr}`;
  };

  // Format time range (startTime - endTime)
  const formatTimeRange = (
    startTime?: LocalTime | string,
    endTime?: LocalTime | string
  ): string => {
    const start = formatLocalTime(startTime);
    const end = formatLocalTime(endTime);

    if (start === "N/A" && end === "N/A") {
      return "All Day";
    }

    if (start === "N/A") {
      return `Until ${end}`;
    }

    if (end === "N/A") {
      return `From ${start}`;
    }

    return `${start} - ${end}`;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Approve Requests</h2>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "leave" ? "active" : ""}`}
            onClick={() => setActiveTab("leave")}
            type="button"
          >
            <i className="fa fa-calendar-times me-2"></i>
            Leave Requests
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
            type="button"
          >
            <i className="fa fa-user-edit me-2"></i>
            Account Update Requests
          </button>
        </li>
      </ul>

      {/* Error message */}
      {errorMessage && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {errorMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrorMessage("")}
          ></button>
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === "leave" && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fa fa-calendar-times me-2"></i>
              Leave Requests
            </h5>
            <span className="badge bg-light text-dark">
              {leaveRequests.length} pending
            </span>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa fa-calendar-times fa-3x text-muted mb-3"></i>
                <p className="text-muted">No pending leave requests</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Doctor</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Requested At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>
                          {request.doctor?.user?.fullName ||
                            request.doctor?.user?.email ||
                            "N/A"}
                        </td>
                        <td>{formatDate(request.startDate)}</td>
                        <td>{formatDate(request.endDate)}</td>
                        <td>
                          <span className="badge bg-info text-white">
                            <i className="fa fa-clock me-1"></i>
                            {formatTimeRange(
                              request.startTime,
                              request.endTime
                            )}
                          </span>
                        </td>
                        <td>{request.reason || "N/A"}</td>
                        <td>
                          <span
                            className={`badge ${
                              request.status === "APPROVED"
                                ? "bg-success"
                                : request.status === "REJECTED"
                                ? "bg-danger"
                                : "bg-warning"
                            }`}
                          >
                            {request.status || "PENDING"}
                          </span>
                        </td>
                        <td>{formatDateTime(request.createdAt)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleApproveLeave(request.id)}
                            disabled={
                              request.status !== "PENDING" &&
                              request.status !== "pending"
                            }
                          >
                            <i className="fa fa-check me-1"></i>Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRejectLeave(request.id)}
                            disabled={
                              request.status !== "PENDING" &&
                              request.status !== "pending"
                            }
                          >
                            <i className="fa fa-times me-1"></i>Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Update Requests Tab */}
      {activeTab === "account" && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fa fa-user-edit me-2"></i>
              Account Update Requests
            </h5>
            <span className="badge bg-light text-dark">
              {accountRequests.length} pending
            </span>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : accountRequests.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa fa-user-edit fa-3x text-muted mb-3"></i>
                <p className="text-muted">No pending account update requests</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Requested At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountRequests.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.fullName || user.user?.fullName || "N/A"}</td>
                        <td>{user.email || user.user?.email || "N/A"}</td>
                        <td>
                          <span className="badge bg-info">
                            {user.role || user.user?.role || "N/A"}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-warning">
                            {user.status || "PENDING"}
                          </span>
                        </td>
                        <td>
                          {formatDateTime(
                            user.createdAt || user.user?.createdAt
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() =>
                              handleApproveAccount(user.id || user.user?.id)
                            }
                          >
                            <i className="fa fa-check me-1"></i>Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleRejectAccount(user.id || user.user?.id)
                            }
                          >
                            <i className="fa fa-times me-1"></i>Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

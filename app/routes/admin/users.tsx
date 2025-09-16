import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faEdit,
  faSave,
  faTimes,
  faSpinner,
  faCheck,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import "~/styles/table.css";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface EditingUser {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users/profile");

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            // Try to parse as JSON first
            try {
              const jsonError = JSON.parse(errorData);
              errorMessage = jsonError.error || errorData;
            } catch {
              // If not JSON, use the text as is
              errorMessage = errorData;
            }
          }
        } catch {
          // If we can't read the response body, use the default error message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        // For self-update, we only have one user (the current user)
        setUsers([data.user]);
      } else {
        throw new Error(data.error || "Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
    });
    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setError("");
    setSuccess("");
  };

  const saveUser = async () => {
    if (!editingUser) return;

    if (!editingUser.name.trim() || !editingUser.email.trim()) {
      setError("Name and email are required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingUser.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingUser.name.trim(),
            email: editingUser.email.toLowerCase().trim(),
            ...(editingUser.password && editingUser.password.trim() && {
              password: editingUser.password.trim()
            }),
          }),
        }
      );

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            // Try to parse as JSON first
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorText;
            } catch {
              // If not JSON, use the text as is
              errorMessage = errorText;
            }
          }
        } catch {
          // If we can't read the response body, use the default error message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        // Update the user in the local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === editingUser.id
              ? { ...user, ...data.user }
              : user
          )
        );

        setSuccess("Profile updated successfully");
        setEditingUser(null);
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-gray-500" />
        <span className="ml-2 text-gray-500">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faUsers} className="mr-3 text-blue-600" />
          Profile Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your profile information
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <FontAwesomeIcon icon={faCheck} className="text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Profile not found
            </div>
          ) : (
            <div className="space-y-6">
              {users.map((user) => (
                <div key={user.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <Input
                        value={editingUser?.id === user.id ? editingUser.name : user.name}
                        onChange={(e) => {
                          if (editingUser?.id === user.id) {
                            setEditingUser({ ...editingUser, name: e.target.value });
                          } else {
                            startEditing(user);
                            setTimeout(() => {
                              setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null);
                            }, 0);
                          }
                        }}
                        className="w-full"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <Input
                        value={editingUser?.id === user.id ? editingUser.email : user.email}
                        onChange={(e) => {
                          if (editingUser?.id === user.id) {
                            setEditingUser({ ...editingUser, email: e.target.value });
                          } else {
                            startEditing(user);
                            setTimeout(() => {
                              setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null);
                            }, 0);
                          }
                        }}
                        className="w-full"
                        placeholder="Enter your email"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password (leave empty to keep current)
                    </label>
                    <Input
                      type="password"
                      value={editingUser?.id === user.id ? editingUser.password || "" : ""}
                      onChange={(e) => {
                        if (editingUser?.id === user.id) {
                          setEditingUser({ ...editingUser, password: e.target.value });
                        } else {
                          startEditing(user);
                          setTimeout(() => {
                            setEditingUser(prev => prev ? { ...prev, password: e.target.value } : null);
                          }, 0);
                        }
                      }}
                      placeholder="Enter new password"
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        Account created: {formatDate(user.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingUser?.id === user.id ? (
                        <>
                          <Button
                            onClick={saveUser}
                            disabled={updating}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updating ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              <FontAwesomeIcon icon={faSave} />
                            )}
                            <span className="ml-2">Save Changes</span>
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            disabled={updating}
                            variant="outline"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                            <span className="ml-2">Cancel</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => startEditing(user)}
                          variant="outline"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          <span className="ml-2">Edit Profile</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

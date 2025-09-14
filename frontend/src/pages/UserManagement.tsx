"use client"

import type React from "react"

import { UserPlus, Search, Filter, MoreVertical, Edit, Trash2, Eye, X, ImageIcon, Loader2, Key } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import Cropper from "react-cropper"
import "cropperjs/dist/cropper.css"
import type { ReactCropperElement } from "react-cropper"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useQuery } from "@tanstack/react-query"
import { getUsers } from "../api/accounts"
import type { User } from "../types"
import { useCreateAccount } from "@/hooks/auth/useCreateAccount"
import { useEditUser, useEditUserPassword, useDeleteUser } from "@/hooks/useUserManagement"
import type { NewUser } from "@/types"
import { base64ToFile } from "@/lib/fileUtils"
import PaginationControls from "@/components/PaginationControls"
import { processItems } from "@/lib/data-utils"
import FullPageLoader from "@/components/FullpageLoader"
import toast from "react-hot-toast"
import { ConfirmationModal } from "@/components/ConfirmationModal"

const UserManagement = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isViewUserOpen, setIsViewUserOpen] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    password: "",
    role: "USER",
  })

  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "USER",
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 5

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 60000,
    gcTime: 300000,
  })

  const { mutate: createAccount, isPending: isCreating } = useCreateAccount()

  const {
    processedItems: currentUsers,
    totalItems,
    totalPages,
  } = processItems<User>(usersData || [], {
    searchTerm,
    searchKeys: ["name", "email"],
    filterKey: "role",
    filterValue: selectedRole === "All" ? undefined : selectedRole,
    allOptionValue: "All",
    currentPage,
    itemsPerPage: usersPerPage,
  })

  const handleAddUser = () => {
    const avatarFile = croppedImage ? base64ToFile(croppedImage, "profile.png") : null

    const formData = new FormData()
    if (avatarFile) {
      formData.append("image", avatarFile)
    }

    Object.entries(newUser).forEach(([key, value]) => {
      formData.append(key, value)
    })

    createAccount(formData, {
      onSuccess: () => {
        setIsAddUserOpen(false)
        resetForm()
        refetch()
      },
      onError: (error) => {
        console.error("Signup Form Error:", {
          error: error.message,
          formData: formData,
          time: new Date().toISOString(),
        })
      },
    })
  }

  const { mutate, isPending: isUpdating } = useEditUser()

  const handleEditUser = async () => {
    if (!selectedUser) return

    const avatarFile = croppedImage ? base64ToFile(croppedImage, "profile.png") : null

    const formData = new FormData()
    if (avatarFile) {
      formData.append("image", avatarFile)
      formData.append("imageUrl", selectedUser.image.imageUrl)
      formData.append("imagePublicId", selectedUser.image.publicId)
    }

    Object.entries(editUser).forEach(([key, value]) => {
      formData.append(key, value)
    })

    mutate(
      { formData, id: selectedUser.id },
      {
        onSuccess: () => {
          setIsEditUserOpen(false)
          resetForm()
          refetch()
        },

        onError: (error) => {
          console.error("Edit User Error:", {
            error: error.message,
            formData: formData,
            time: new Date().toISOString(),
          })
        },
      },
    )
  }

  const { mutate: changePassword, isPending: isChangingPassword } = useEditUserPassword()

  const handleChangePassword = () => {
    if (!selectedUser) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!")
      return
    }

    changePassword(
      { password: passwordData.newPassword, id: selectedUser.id },
      {
        onSuccess: () => {
          setIsChangePasswordOpen(false)
          resetForm()
          refetch()
        },
        onError: (error) => {
          console.error("Change Password Error:", {
            error: error.message,
            time: new Date().toISOString(),
          })
        },
      },
    )
  }

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    deleteUser(selectedUser.id, {
      onSuccess: () => {
        setIsConfirmationOpen(false)
        resetForm()
        refetch()
      },
      onError: (error) => {
        console.error("Delete User Error:", {
          error: error.message,
          time: new Date().toISOString(),
        })
      },
    })
  }

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "USER",
    })
    setEditUser({
      name: "",
      email: "",
      role: "USER",
    })
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    })
    setImageSrc(null)
    setCroppedImage(null)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
    })
    setIsEditUserOpen(true)
  }

  const openViewModal = (user: User) => {
    setSelectedUser(user)
    setIsViewUserOpen(true)
  }

  const openChangePasswordModal = (user: User) => {
    setSelectedUser(user)
    setIsChangePasswordOpen(true)
  }

  const openConfirmationModal = (user: User) => {
    setSelectedUser(user)
    setIsConfirmationOpen(true)
  }

  const roles = ["All", "ADMIN", "USER"]

  // Avatar cropping state
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const cropperRef = useRef<ReactCropperElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.match("image.*")) {
      alert("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
    }
    reader.onerror = () => {
      alert("Failed to read file")
    }
    reader.readAsDataURL(file)
  }

  const getCropData = () => {
    if (cropperRef.current?.cropper) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas()
      if (canvas) {
        setCroppedImage(canvas.toDataURL())
        setImageSrc(null)
      }
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedRole])

  if (isLoading) {
    return <FullPageLoader message={"Fetching Users Data"} showLogo={true} />
  }

  return (
    <div className="space-y-8">
      {/* Header and Add User Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <Button
          className="gap-2 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 shadow-sm"
          onClick={() => setIsAddUserOpen(true)}
        >
          <UserPlus size={16} />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border-2 border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900 text-lg">Filters</CardTitle>
          <CardDescription className="text-gray-600">Narrow down user list</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-9 bg-white border-2 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2 border-2 border-gray-200 text-gray-900 bg-white hover:bg-gray-50"
                >
                  <Filter size={16} />
                  Role: {selectedRole}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-2 border-gray-200 shadow-lg">
                {roles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className="text-gray-900 hover:bg-gray-50"
                  >
                    {role}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="gap-2 border-2 border-gray-200 text-gray-900 bg-white hover:bg-gray-50"
              onClick={() => {
                setSearchTerm("")
                setSelectedRole("All")
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border-2 border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gray-900 text-lg">Users</CardTitle>
              <CardDescription className="text-gray-600">{totalItems} users found</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-700 font-semibold">User</TableHead>
                <TableHead className="text-gray-700 font-semibold">Role</TableHead>
                <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                        <AvatarImage src={user.image.imageUrl || "/placeholder.svg"} alt="avatar" />
                        <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : user.role === "USER" ? "secondary" : "outline"}
                      className={
                        user.role === "ADMIN"
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : user.role === "USER"
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : ""
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-2 border-gray-200 shadow-lg">
                        <DropdownMenuItem
                          className="gap-2 text-gray-900 hover:bg-gray-50"
                          onClick={() => openViewModal(user)}
                        >
                          <Eye size={16} />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-gray-900 hover:bg-gray-50"
                          onClick={() => openEditModal(user)}
                        >
                          <Edit size={16} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-gray-900 hover:bg-gray-50"
                          onClick={() => openChangePasswordModal(user)}
                        >
                          <Key size={16} />
                          Change Password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-red-600 hover:bg-red-50"
                          onClick={() => openConfirmationModal(user)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between border-t-2 border-gray-200 pt-6">
          <div className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * usersPerPage + 1, totalItems)} to{" "}
            {Math.min(currentPage * usersPerPage, totalItems)} of {totalItems} users
          </div>
          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </CardFooter>
      </Card>

      {/* Add User Modal */}
      <Dialog
        open={isAddUserOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Blur any focused element inside the dialog before closing
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur()
            }
            resetForm()
          }
          setIsAddUserOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-gray-900 text-xl">Add New User</DialogTitle>
            <DialogDescription className="text-gray-600">
              Fill in the details below to create a new user account.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddUser()
            }}
          >
            <div className="grid gap-6 py-4">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label htmlFor="avatar" className="text-gray-700 font-medium">
                  Profile Picture
                </Label>
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 ring-2 ring-gray-200">
                    {croppedImage ? (
                      <AvatarImage src={croppedImage || "/placeholder.svg"} />
                    ) : (
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        <ImageIcon size={28} className="text-gray-400" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-3">
                    <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <Label
                      htmlFor="avatar"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon size={16} />
                      {croppedImage ? "Change" : "Upload"} Image
                    </Label>
                    {croppedImage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCroppedImage(null)}
                        type="button"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <X size={16} className="mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Cropper */}
              {imageSrc && !croppedImage && (
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Crop Image</Label>
                  <div className="h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <Cropper
                      src={imageSrc}
                      style={{ height: 256, width: "100%" }}
                      initialAspectRatio={1}
                      guides={true}
                      ref={cropperRef}
                    />
                  </div>
                  <Button onClick={getCropData} className="mt-3 bg-gray-900 hover:bg-gray-800 text-white" type="button">
                    Crop Image
                  </Button>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  minLength={2}
                  className="bg-white border-2 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                  className="bg-white border-2 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="bg-white border-2 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 font-medium">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  required
                >
                  <SelectTrigger id="role" className="w-[180px] bg-white border-2 border-gray-200 text-gray-900">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
                    <SelectItem value="ADMIN" className="text-gray-900 hover:bg-gray-50">
                      Admin
                    </SelectItem>
                    <SelectItem value="USER" className="text-gray-900 hover:bg-gray-50">
                      User
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddUserOpen(false)
                  resetForm()
                }}
                type="button"
                className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button disabled={isCreating} type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                {isCreating && <Loader2 className="animate-spin mr-2" />}
                Add User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog
        open={isEditUserOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Blur any focused element inside the dialog before closing
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur()
            }
            resetForm()
            setSelectedUser(null)
            setImageSrc(null)
            setCroppedImage(null)
          }
          setIsEditUserOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-gray-900 text-xl">Edit User</DialogTitle>
            <DialogDescription className="text-gray-600">Update the user details below.</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEditUser()
            }}
          >
            <div className="grid gap-6 py-4">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label htmlFor="edit-avatar" className="text-gray-700 font-medium">
                  Profile Picture
                </Label>
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 ring-2 ring-gray-200">
                    {croppedImage ? (
                      <AvatarImage src={croppedImage || "/placeholder.svg"} />
                    ) : selectedUser?.image?.imageUrl ? (
                      <AvatarImage src={selectedUser.image.imageUrl || "/placeholder.svg"} />
                    ) : (
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        <ImageIcon size={28} className="text-gray-400" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-3">
                    <Input
                      id="edit-avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Label
                      htmlFor="edit-avatar"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon size={16} />
                      {croppedImage ? "Change" : "Upload"} Image
                    </Label>
                    {(croppedImage || selectedUser?.image?.imageUrl) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCroppedImage(null)
                        }}
                        type="button"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <X size={16} className="mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Cropper */}
              {imageSrc && !croppedImage && (
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Crop Image</Label>
                  <div className="h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <Cropper
                      src={imageSrc}
                      style={{ height: 256, width: "100%" }}
                      initialAspectRatio={1}
                      guides={true}
                      ref={cropperRef}
                    />
                  </div>
                  <Button onClick={getCropData} className="mt-3 bg-gray-900 hover:bg-gray-800 text-white" type="button">
                    Crop Image
                  </Button>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-gray-700 font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  minLength={2}
                  className="bg-white border-2 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-gray-700 font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                  className="bg-white border-2 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-gray-700 font-medium">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editUser.role}
                  onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                  required
                >
                  <SelectTrigger id="edit-role" className="w-[180px] bg-white border-2 border-gray-200 text-gray-900">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
                    <SelectItem value="ADMIN" className="text-gray-900 hover:bg-gray-50">
                      Admin
                    </SelectItem>
                    <SelectItem value="USER" className="text-gray-900 hover:bg-gray-50">
                      User
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditUserOpen(false)
                  resetForm()
                }}
                type="button"
                className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button disabled={isUpdating} type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                {isUpdating && <Loader2 className="animate-spin mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog
        open={isViewUserOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Blur any focused element inside the dialog before closing
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur()
            }
            setSelectedUser(null)
          }
          setIsViewUserOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-[500px] bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-gray-900 text-xl">User Details</DialogTitle>
            <DialogDescription className="text-gray-600">View detailed information about this user.</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                <Avatar className="h-28 w-28 ring-4 ring-gray-100">
                  <AvatarImage src={selectedUser.image.imageUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gray-100 text-gray-700 text-xl font-medium">
                    {selectedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-700 font-medium">Role</Label>
                    <div className="mt-2">
                      <Badge
                        variant={
                          selectedUser.role === "ADMIN"
                            ? "default"
                            : selectedUser.role === "USER"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          selectedUser.role === "ADMIN"
                            ? "bg-gray-900 text-white"
                            : selectedUser.role === "USER"
                              ? "bg-gray-100 text-gray-700"
                              : ""
                        }
                      >
                        {selectedUser.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Account Created</Label>
                  <p className="text-gray-900 mt-2">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsViewUserOpen(false)}
              className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur()
            }
            setSelectedUser(null)
            setPasswordData({
              newPassword: "",
              confirmPassword: "",
            })
          }
          setIsChangePasswordOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-[500px] bg-white border-2 border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-gray-900 text-xl">Change Password</DialogTitle>
            <DialogDescription className="text-gray-600">
              Change the password for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleChangePassword()
            }}
          >
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-700 font-medium">
                  New Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="bg-white border-2 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
                  Confirm New Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="bg-white border-2 border-gray-200 focus:border-gray-400 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(false)}
                  type="button"
                  className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button disabled={isChangingPassword} className="bg-gray-900 hover:bg-gray-800 text-white">
                  {isChangingPassword && <Loader2 className="animate-spin mr-2" />}
                  Change Password
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleDeleteUser}
        itemName={selectedUser?.email}
        isLoading={isDeleting}
        title="Delete User"
        description="Are you sure you want to delete this user?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export default UserManagement

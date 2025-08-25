import { 
  editUserCredential,
  editUserPassword,
  deleteUser,
} from "@/api/accounts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types";
import toast from "react-hot-toast";

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formData, id }: { formData: FormData; id: string }) =>
      editUserCredential(formData, id),
    onSuccess: (response) => {
      const { user } = response;

      queryClient.setQueryData(['users'], (oldUsers: User[]) =>
        oldUsers
          ? oldUsers.map((oldUser) =>
              oldUser.id === user.id ? { ...oldUser, ...user } : oldUser
            )
          : [user]
      );

      toast.success(response.message);
    },
    onError: (error: Error) => {
      console.error('Edit User Error:', {
        message: error.message,
        time: new Date().toISOString(),
        stack: error.stack,
      });
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};


export const useEditUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ password, id }: { password: string; id: string }) =>
      editUserPassword({ password }, id),
    onSuccess: (response) => {
      const { user } = response;

      queryClient.setQueryData(['users'], (oldUsers: User[]) =>
        oldUsers
          ? oldUsers.map((oldUser) =>
              oldUser.id === user.id ? { ...oldUser, ...user } : oldUser
            )
          : [user]
      );

      toast.success(response.message);
    },
    onError: (error: Error) => {
      console.error('Edit User Password Error:', {
        message: error.message,
        time: new Date().toISOString(),
        stack: error.stack,
      });
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (response) => {
      const { user } = response;

      queryClient.setQueryData(['users'], (oldUsers: User[]) =>
        oldUsers
          ? oldUsers.filter((oldUser) => oldUser.id !== user.id)
          : [user]
      );

      toast.success(response.message);
    },
    onError: (error: Error) => {
      console.error('Delete User Error:', {
        message: error.message,
        time: new Date().toISOString(),
        stack: error.stack,
      });
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
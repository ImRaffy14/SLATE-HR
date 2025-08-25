import { createAccount } from "@/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types";
import toast from "react-hot-toast"

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccount,
    onSuccess: (response) => {
      const { user } = response;
      
      queryClient.setQueryData(['users'], (oldUsers: User[] | undefined) => 
        oldUsers ? [user, ...oldUsers] : [user]
      );
      
      toast.success(response.message);
    },
    onError: (error: Error) => {
      console.error('Create Account Error:', {
        message: error.message,
        time: new Date().toISOString(),
        stack: error.stack
      });
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

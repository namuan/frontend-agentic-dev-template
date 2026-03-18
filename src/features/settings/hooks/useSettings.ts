import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/lib/hooks/useToast';
import type { Preferences, SettingsData } from '@/lib/types/settingsSchema';
import { fetchSettings, saveSettings } from '../api';

export function useSettings(): {
  data: SettingsData | undefined;
  isLoading: boolean;
  error: unknown;
  save: (preferences: Preferences) => Promise<void>;
  isSaving: boolean;
  saveError: unknown;
  refetch: () => void;
} {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const query = useQuery<SettingsData>({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    throwOnError: false,
  });

  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(['settings'], settings);
      push({ title: 'Settings saved', description: 'Preferences updated successfully.', tone: 'success' });
    },
  });

  return {
    data: query.data,
    isLoading: query.isPending,
    error: query.error,
    save: async (preferences) => {
      await mutation.mutateAsync(preferences);
    },
    isSaving: mutation.isPending,
    saveError: mutation.error,
    refetch: () => {
      void query.refetch();
    },
  };
}

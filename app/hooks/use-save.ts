// A custom save hook
// For the markdown master, customizable.
import { useState } from "react";

import { useNavigate } from "react-router";

export interface SaveConfig<T = unknown> {
  endpoint: string;
  method?: "PUT" | "POST" | "PATCH";
  headers?: Record<string, string>;
  onSuccess?: {
    title: string;
    description: string;
    redirectPath?: string;
    redirectPrompt?: string;
    confirmText?: string;
  };
  errorMessages?: Record<string, string>;
  transformPayload?: (data: T) => unknown;
}

export interface SaveDialogContent {
  title: string;
  description: string;
  type: "success" | "error" | "confirm";
  onConfirm?: () => void;
  confirmText?: string;
}

export function useSave<T = unknown>() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<SaveDialogContent | null>(
    null,
  );

  const save = async (data: T, config: SaveConfig<T>): Promise<boolean> => {
    setIsLoading(true);

    try {
      const payload = config.transformPayload
        ? config.transformPayload(data)
        : data;
      const bodyPayload = JSON.stringify(payload);

      const res = await fetch(config.endpoint, {
        method: config.method || "PUT",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: bodyPayload,
      });

      if (!res.ok) {
        await handleError(res, config.errorMessages);
        return false;
      }

      // Success case
      if (config.onSuccess) {
        if (config.onSuccess.redirectPath) {
          setDialogContent({
            title: config.onSuccess.title,
            description:
              config.onSuccess.redirectPrompt || config.onSuccess.description,
            type: "confirm",
            confirmText: config.onSuccess.confirmText,
            onConfirm: () => {
              if (config.onSuccess?.redirectPath) {
                navigate(config.onSuccess.redirectPath);
              }
            },
          });
        } else {
          setDialogContent({
            title: config.onSuccess.title,
            description: config.onSuccess.description,
            type: "success",
          });
        }
        setDialogOpen(true);
      }

      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDialogContent({
        title: "Save Failed",
        description: msg,
        type: "error",
      });
      setDialogOpen(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = async (
    res: Response,
    customErrorMessages?: Record<string, string>,
  ) => {
    try {
      const responseData = await res.json();
      console.log(responseData);

      if (responseData?.error) {
        setDialogContent({
          title: "Save Failed",
          description: responseData.error,
          type: "error",
        });
      } else if (responseData.message) {
        const customMessage = customErrorMessages?.[responseData.message];
        let description = "";

        if (customMessage) {
          description = customMessage;
        } else {
          // Default error messages
          switch (responseData.message) {
            case "INSUFFICIENT_PERMISSIONS":
              description =
                "You are not authorized to perform this operation. Please try again later.";
              break;
            case "NOT_FOUND":
            case "PROBLEM_NOT_FOUND":
              description =
                "The resource you are trying to access does not exist. Please check the URL and try again.";
              break;
            case "LOCKED":
            case "PROBLEM_LOCKED":
              description =
                "Modifications to this resource are restricted. Please contact an administrator for further assistance.";
              break;
            default:
              description = `Operation failed: ${responseData.message}`;
          }
        }

        setDialogContent({
          title: "Save Failed",
          description,
          type: "error",
        });
      } else {
        setDialogContent({
          title: "Save Failed",
          description: `Failed to save: ${res.status}. More details are available in the console.`,
          type: "error",
        });
      }
    } catch (parseError) {
      setDialogContent({
        title: "Save Failed",
        description: `Failed to save: ${res.status}. More details are available in the console.`,
        type: "error",
      });
      console.log(parseError);
    }

    setDialogOpen(true);
  };

  return {
    save,
    isLoading,
    dialogOpen,
    setDialogOpen,
    dialogContent,
  };
}

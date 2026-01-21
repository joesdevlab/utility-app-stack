"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

interface DebugLog {
  timestamp: string;
  level: "info" | "success" | "error" | "warn";
  message: string;
  data?: unknown;
}

export default function DebugEntriesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (level: DebugLog["level"], message: string, data?: unknown) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
      },
    ]);
  };

  const clearLogs = () => setLogs([]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    clearLogs();

    const supabase = createClient();

    // Step 1: Check auth status
    addLog("info", "Step 1: Checking authentication status...");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addLog("error", "Failed to get session", sessionError);
        setIsRunning(false);
        return;
      }
      if (!sessionData.session) {
        addLog("error", "No active session - user not logged in");
        setIsRunning(false);
        return;
      }
      addLog("success", "Session found", {
        userId: sessionData.session.user.id,
        email: sessionData.session.user.email,
        expiresAt: sessionData.session.expires_at,
      });
    } catch (e) {
      addLog("error", "Exception checking session", e);
      setIsRunning(false);
      return;
    }

    // Step 2: Check if user matches
    addLog("info", "Step 2: Verifying user context...");
    if (!user) {
      addLog("error", "Auth context user is null - context not synced");
      setIsRunning(false);
      return;
    }
    addLog("success", "User context verified", { userId: user.id, email: user.email });

    // Step 3: Test read access
    addLog("info", "Step 3: Testing READ access to apprentice_entries...");
    try {
      const { data: readData, error: readError, count } = await supabase
        .from("apprentice_entries")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .limit(5);

      if (readError) {
        addLog("error", "READ failed", {
          message: readError.message,
          code: readError.code,
          details: readError.details,
          hint: readError.hint,
        });
      } else {
        addLog("success", `READ succeeded - found ${count ?? readData?.length ?? 0} entries`, {
          sampleCount: readData?.length ?? 0,
          firstEntry: readData?.[0] ? { id: readData[0].id, date: readData[0].date } : null,
        });
      }
    } catch (e) {
      addLog("error", "Exception during READ", e);
    }

    // Step 4: Test insert access
    addLog("info", "Step 4: Testing INSERT access to apprentice_entries...");
    const testEntry = {
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      raw_transcript: "[DEBUG TEST] This is a test entry",
      formatted_entry: "[DEBUG TEST] Testing Supabase insert functionality",
      tasks: [{ description: "Debug test task", hours: 0.1, tools: [], skills: [] }],
      hours: 0.1,
      total_hours: 0.1,
      notes: "Debug test - safe to delete",
      is_deleted: false,
    };

    addLog("info", "Attempting to insert test entry...", testEntry);

    let insertedId: string | null = null;
    try {
      const { data: insertData, error: insertError } = await supabase
        .from("apprentice_entries")
        .insert(testEntry)
        .select()
        .single();

      if (insertError) {
        addLog("error", "INSERT failed", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });
      } else {
        insertedId = insertData?.id;
        addLog("success", "INSERT succeeded", {
          id: insertData?.id,
          createdAt: insertData?.created_at,
        });
      }
    } catch (e) {
      addLog("error", "Exception during INSERT", e);
    }

    // Step 5: Verify the insert by reading it back
    if (insertedId) {
      addLog("info", "Step 5: Verifying inserted entry...");
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from("apprentice_entries")
          .select("*")
          .eq("id", insertedId)
          .single();

        if (verifyError) {
          addLog("error", "VERIFY READ failed", verifyError);
        } else {
          addLog("success", "VERIFY READ succeeded - entry exists in database", {
            id: verifyData?.id,
            date: verifyData?.date,
            formatted_entry: verifyData?.formatted_entry?.substring(0, 50),
          });
        }
      } catch (e) {
        addLog("error", "Exception during VERIFY READ", e);
      }

      // Step 6: Clean up test entry
      addLog("info", "Step 6: Cleaning up test entry (hard delete)...");
      try {
        const { error: deleteError } = await supabase
          .from("apprentice_entries")
          .delete()
          .eq("id", insertedId);

        if (deleteError) {
          addLog("warn", "DELETE failed - test entry remains in database", deleteError);
        } else {
          addLog("success", "DELETE succeeded - test entry cleaned up");
        }
      } catch (e) {
        addLog("error", "Exception during DELETE", e);
      }
    }

    // Step 7: Check RLS policies
    addLog("info", "Step 7: Checking database connectivity...");
    try {
      const { data, error } = await supabase.rpc("get_current_user_id");
      if (error) {
        addLog("warn", "RPC get_current_user_id not available (this is normal)", error.message);
      } else {
        addLog("success", "RPC returned user_id", data);
      }
    } catch (e) {
      addLog("warn", "RPC check failed (this may be normal)", e);
    }

    addLog("info", "=== Diagnostics complete ===");
    setIsRunning(false);
  };

  const getLevelColor = (level: DebugLog["level"]) => {
    switch (level) {
      case "success":
        return "text-green-600 bg-green-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "warn":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  if (authLoading) {
    return (
      <div className="p-8">
        <p>Loading auth...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug: Entry Save Flow</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Current State</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>User:</strong> {user ? `${user.email} (${user.id})` : "Not logged in"}
            </p>
            <p>
              <strong>Auth Loading:</strong> {authLoading ? "Yes" : "No"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={runDiagnostics}
              disabled={isRunning || !user}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? "Running..." : "Run Diagnostics"}
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear Logs
            </button>
          </div>

          {!user && (
            <p className="text-red-600 text-sm">You must be logged in to run diagnostics.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Diagnostic Logs</h2>
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet. Click &quot;Run Diagnostics&quot; to start.</p>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${getLevelColor(log.level)}`}
                >
                  <div className="flex gap-2">
                    <span className="text-gray-400">{log.timestamp.split("T")[1]?.split(".")[0]}</span>
                    <span className="font-semibold uppercase">[{log.level}]</span>
                    <span>{log.message}</span>
                  </div>
                  {log.data !== undefined && (
                    <pre className="mt-1 pl-4 text-gray-600 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

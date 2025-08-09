import React, { useEffect, useState } from "react";
import { FiSave, FiTrash2, FiMail, FiBell, FiShield, FiDatabase, FiUpload, FiMoon, FiSun } from "react-icons/fi";

const AdminSettings = () => {
  const [values, setValues] = useState(() => {
    try {
      const stored = localStorage.getItem("adminSettings");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      siteName: "GPPG",
      supportEmail: "support@example.com",
      alertsEmailEnabled: true,
      dailyDigestHour: 8,
      backupFrequency: "daily",
      backupRetentionDays: 14,
      allowPublicReports: true,
      autoVerifyLowRisk: false,
      theme: "light",
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("adminSettings", JSON.stringify(values));
    } catch {}
  }, [values]);

  const onChange = (key, val) => setValues((v) => ({ ...v, [key]: val }));

  const restoreDefaults = () => {
    setValues({
      siteName: "GPPG",
      supportEmail: "support@example.com",
      alertsEmailEnabled: true,
      dailyDigestHour: 8,
      backupFrequency: "daily",
      backupRetentionDays: 14,
      allowPublicReports: true,
      autoVerifyLowRisk: false,
      theme: "light",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={restoreDefaults}
            className="inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 hover:bg-red-100">
            <FiTrash2 /> Reset
          </button>
          <button className="inline-flex items-center gap-1 rounded-md bg-[#4a1d1f] text-white text-sm px-3 py-2 hover:bg-[#6d2a2d]">
            <FiSave /> Save
          </button>
        </div>
      </div>

      {/* General */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              value={values.siteName}
              onChange={(e) => onChange("siteName", e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={values.supportEmail}
                onChange={(e) => onChange("supportEmail", e.target.value)}
                className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FiBell /> Email Alerts
            </label>
            <div className="flex items-center gap-3 text-sm">
              <input
                id="alertsEmailEnabled"
                type="checkbox"
                checked={values.alertsEmailEnabled}
                onChange={(e) => onChange("alertsEmailEnabled", e.target.checked)}
              />
              <label htmlFor="alertsEmailEnabled">Enable email alerts for new reports</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Digest Time (24h)</label>
            <input
              type="number"
              min={0}
              max={23}
              value={values.dailyDigestHour}
              onChange={(e) => onChange("dailyDigestHour", Number(e.target.value))}
              className="w-32 border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </section>

      {/* Reports Policy */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reports Policy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FiShield /> Public Reports
            </label>
            <div className="flex items-center gap-3 text-sm">
              <input
                id="allowPublicReports"
                type="checkbox"
                checked={values.allowPublicReports}
                onChange={(e) => onChange("allowPublicReports", e.target.checked)}
              />
              <label htmlFor="allowPublicReports">Allow unauthenticated public users to submit reports</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auto-verify Low-risk</label>
            <div className="flex items-center gap-3 text-sm">
              <input
                id="autoVerifyLowRisk"
                type="checkbox"
                checked={values.autoVerifyLowRisk}
                onChange={(e) => onChange("autoVerifyLowRisk", e.target.checked)}
              />
              <label htmlFor="autoVerifyLowRisk">Automatically mark low urgency reports as verified</label>
            </div>
          </div>
        </div>
      </section>

      {/* Data & Backups */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiDatabase /> Data & Backups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
            <select
              value={values.backupFrequency}
              onChange={(e) => onChange("backupFrequency", e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a1d1f]/30 focus:border-[#4a1d1f]">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retention (days)</label>
            <input
              type="number"
              min={1}
              value={values.backupRetentionDays}
              onChange={(e) => onChange("backupRetentionDays", Number(e.target.value))}
              className="w-40 border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button className="rounded-md bg-[#4a1d1f] text-white text-sm px-3 py-2 hover:bg-[#6d2a2d] inline-flex items-center gap-2">
            <FiUpload /> Trigger Backup
          </button>
          <button className="rounded-md bg-gray-100 text-gray-800 text-sm px-3 py-2 hover:bg-gray-200">Restore from File</button>
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onChange("theme", "light")}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${values.theme === "light" ? "bg-gray-900 text-white" : "bg-white"}`}>
            <FiSun /> Light
          </button>
          <button
            onClick={() => onChange("theme", "dark")}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${values.theme === "dark" ? "bg-gray-900 text-white" : "bg-white"}`}>
            <FiMoon /> Dark
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminSettings;

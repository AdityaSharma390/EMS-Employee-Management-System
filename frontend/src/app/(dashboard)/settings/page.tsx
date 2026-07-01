import { Settings, HardDrive } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-slate-100 font-sans">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure corporate EMS environment settings and integrations.</p>
      </div>

      {/* Settings Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-4 border-b border-slate-150 dark:border-slate-800">
          <Settings size={18} className="text-indigo-600" /> General Preferences
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-750 dark:text-slate-200">Default Currency</p>
              <p className="text-[10px] text-slate-400">Specify currency used throughout dashboards & reports.</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-750 dark:text-slate-300">
              <option value="USD">USD ($) - United States Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <div>
              <p className="font-semibold text-slate-750 dark:text-slate-200">Default Payroll Tax Rate</p>
              <p className="text-[10px] text-slate-400">Standard percentage rate applied to payroll calculations.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue="15"
                className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100 text-center"
              />
              <span className="font-bold text-slate-405">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <div>
              <p className="font-semibold text-slate-750 dark:text-slate-200">System Notification Emails</p>
              <p className="text-[10px] text-slate-400">Trigger warnings for suspended/resigned employee records.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer animate-none" />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-4 border-b border-slate-150 dark:border-slate-800">
          <HardDrive size={18} className="text-indigo-650" /> System Information & Backup
        </h3>

        <div className="space-y-4 text-xs text-slate-650 dark:text-slate-350">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-405">Database Engine:</span>
            <span className="font-medium text-slate-750 dark:text-slate-200">Prisma Client v6.19 (SQLite adapter)</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <span className="font-semibold text-slate-405">Environment Node Version:</span>
            <span className="font-medium text-slate-750 dark:text-slate-200">Node v20.x / Next.js 15.x</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <span className="font-semibold text-slate-405">Deployment Status:</span>
            <span className="text-green-600 dark:text-green-400 font-bold">Local Development (SQLite)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type HomeEditorTab = "HERO" | "HEADLINE" | "CTA" | "INFO_CARDS" | "WORKSPACE";

interface HomeEditorTabsProps {
  activeTab: HomeEditorTab;
  onTabChange: (tab: HomeEditorTab) => void;
  disabled?: boolean;
}

export function HomeEditorTabs({ activeTab, onTabChange, disabled }: HomeEditorTabsProps) {
  const tabs: { id: HomeEditorTab; label: string }[] = [
    { id: "HERO", label: "HERO" },
    { id: "HEADLINE", label: "HEADLINE" },
    { id: "CTA", label: "CTA" },
    { id: "INFO_CARDS", label: "INFO CARDS" },
    { id: "WORKSPACE", label: "WORKSPACE" },
  ];

  return (
    <div className="home-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          disabled={disabled}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
      <style jsx>{`
        .home-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .home-tabs::-webkit-scrollbar { display: none; }
        .tab-button {
          padding: 8px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 11px;
          font-family: var(--font-mono), monospace;
          cursor: pointer;
          white-space: nowrap;
        }
        .tab-button:hover:not(:disabled) {
          background: var(--surface-low);
          color: var(--foreground);
        }
        .tab-button.active {
          background: var(--primary);
          color: #003824; /* Restrained Helsinki green/cyan dark contrast */
          border-color: var(--primary);
        }
        .tab-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 640px) {
           .home-tabs { padding-bottom: 4px; }
        }
      `}</style>
    </div>
  );
}

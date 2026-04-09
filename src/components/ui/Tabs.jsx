import React from 'react';
import { Tabs as HeroTabs, Tab } from "@heroui/react";
import { cn } from '../../lib/utils';

function Tabs({ tabs, activeTab, onTabChange, className }) {
  return (
    <HeroTabs
      selectedKey={activeTab}
      onSelectionChange={onTabChange}
      variant="underlined"
      color="primary"
      classNames={{
        tabList: cn("gap-2 w-full relative rounded-none p-0 border-b border-divider", className),
        cursor: "w-full bg-primary",
        tab: "max-w-fit px-0 h-10",
        tabContent: "group-data-[selected=true]:text-primary"
      }}
      items={tabs}
    >
      {(item) => (
        <Tab key={item.id} title={item.label} isDisabled={item.disabled} />
      )}
    </HeroTabs>
  );
}

Tabs.displayName = "Tabs";

export { Tabs };

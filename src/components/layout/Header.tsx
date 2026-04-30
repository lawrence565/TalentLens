import React from "react";
import type { User } from "../../types";
import Button from "../ui/Button";
import Icon from "../ui/Icon";

interface HeaderProps {
  user: User | null;
  onLogout?: () => void | Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => (
  <header className="border-b border-gray-200 bg-white">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
          <Icon name="spark" size={22} />
        </span>
        <span className="text-lg font-semibold text-gray-900">TalentLens</span>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden text-sm text-gray-600 sm:inline">
              {user.name}
            </span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Log out
            </Button>
          </>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Icon name="user" size={18} />
          </span>
        )}
      </div>
    </div>
  </header>
);

export default Header;

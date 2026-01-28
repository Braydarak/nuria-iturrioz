import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

interface LayoutContextType {
  isHeaderOpen: boolean;
  setIsHeaderOpen: Dispatch<SetStateAction<boolean>>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ isHeaderOpen, setIsHeaderOpen }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

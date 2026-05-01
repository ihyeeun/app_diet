import { getStackflowStackComponent } from "./stackflowRouter";

const StackComponent = getStackflowStackComponent();

export function StackflowRuntime() {
  return <StackComponent />;
}

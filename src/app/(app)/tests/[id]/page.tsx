import { TestView } from "@/components/test-view";

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TestView id={id} />;
}

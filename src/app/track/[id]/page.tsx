import { Suspense } from "react";
import TicketView from "./TicketView";

export default function TicketPage({ params }: PageProps<"/track/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto mt-14 h-96 max-w-xl rounded-3xl bg-panel" />}>
      <Ticket params={params} />
    </Suspense>
  );
}

async function Ticket({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketView id={id} />;
}

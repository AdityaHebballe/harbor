export function StoreSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      <div className="harbor-skel h-[360px] w-full rounded-[6px] bg-elevated/40" />
      {[0, 1].map((r) => (
        <div key={r} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 ps-[9px]">
            <div className="harbor-skel h-4 w-40 rounded-md bg-elevated/40" />
            <div className="harbor-skel h-3 w-56 rounded-md bg-elevated/30" />
          </div>
          <div className="grid grid-flow-col auto-cols-[252px] gap-5 overflow-hidden ps-[9px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                <div className="harbor-skel aspect-[16/10] w-full rounded-[4px] bg-elevated/40" />
                <div className="flex flex-col gap-1.5">
                  <div className="harbor-skel h-3 w-3/5 rounded bg-elevated/35" />
                  <div className="harbor-skel h-3 w-2/5 rounded bg-elevated/25" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { GroupDetailModal } from "@/views/profile/group-detail-modal";
import { subscribeOpenGroup } from "@/lib/social/open-group";
import { requestOpenProfile } from "@/lib/social/open-profile";

export function GroupDetailHost() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => subscribeOpenGroup(setId), []);
  if (!id) return null;
  return (
    <GroupDetailModal
      id={id}
      onClose={() => setId(null)}
      onChanged={() => {}}
      onOpenProfile={(h) => {
        setId(null);
        requestOpenProfile(h);
      }}
    />
  );
}

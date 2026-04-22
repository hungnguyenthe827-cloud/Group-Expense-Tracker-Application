import { useEffect, useState } from "react";
import { getGroups } from "../../services/groupService";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";

type Group = {
  id: string;
  name: string;
};

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await getGroups();
      setGroups(res.data);
    } catch (err) {
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h2>Your Groups</h2>

      {groups.map((g) => (
        <Card key={g.id}>
          <h3>{g.name}</h3>
        </Card>
      ))}
    </div>
  );
}
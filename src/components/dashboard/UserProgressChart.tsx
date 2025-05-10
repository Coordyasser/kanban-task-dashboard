
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface UserTaskData {
  name: string;
  tasks: number;
  completed: number;
}

interface UserProgressChartProps {
  data: UserTaskData[];
}

const UserProgressChart = ({ data }: UserProgressChartProps) => {
  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle>User Task Progress</CardTitle>
        <CardDescription>Task completion rate by user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" name="Total Tasks" stackId="a" fill="#1EAEDB" />
              <Bar dataKey="completed" name="Completed" stackId="a" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProgressChart;

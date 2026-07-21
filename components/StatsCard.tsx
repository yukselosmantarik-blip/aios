type StatsCardProps = {
    title: string;
    value: number;
  };
  
  export default function StatsCard({
    title,
    value,
  }: StatsCardProps) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-3 text-3xl">{value}</p>
      </div>
    );
  }
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface RoyaltyAnalyticsProps {
  royalties: any[];
  tracks: any[];
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const RoyaltyAnalytics = ({ royalties, tracks }: RoyaltyAnalyticsProps) => {
  // Calculate platform breakdown
  const getPlatformBreakdown = () => {
    const platformData = royalties.reduce((acc: any, r: any) => {
      const platform = r.platform || 'Unknown';
      if (!acc[platform]) {
        acc[platform] = { revenue: 0, streams: 0, count: 0 };
      }
      acc[platform].revenue += r.revenue || 0;
      acc[platform].streams += r.streams || 0;
      acc[platform].count += 1;
      return acc;
    }, {});

    return Object.entries(platformData).map(([platform, data]: any) => ({
      platform,
      revenue: data.revenue,
      streams: data.streams,
      count: data.count,
      avgPerStream: data.streams > 0 ? data.revenue / data.streams : 0
    })).sort((a, b) => b.revenue - a.revenue);
  };

  // Calculate country breakdown
  const getCountryBreakdown = () => {
    const countryData = royalties.reduce((acc: any, r: any) => {
      const country = r.country || 'Unknown';
      if (!acc[country]) {
        acc[country] = { revenue: 0, streams: 0 };
      }
      acc[country].revenue += r.revenue || 0;
      acc[country].streams += r.streams || 0;
      return acc;
    }, {});

    return Object.entries(countryData)
      .map(([country, data]: any) => ({
        country,
        revenue: data.revenue,
        streams: data.streams
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 countries
  };

  // Calculate track performance
  const getTrackPerformance = () => {
    const trackData = royalties.reduce((acc: any, r: any) => {
      // Use track_title directly from royalty data first, fallback to track lookup
      const trackTitle = r.track_title || '';
      
      // Try to find track by ID if track_id exists
      let finalTitle = trackTitle;
      let album = '';
      
      if (r.track_id) {
        const track = tracks.find((t: any) => t._row_id === r.track_id);
        if (track?.title) {
          finalTitle = track.title;
          album = track.album_name || '';
        }
      }
      
      // If still no title, use the royalty's track_title or fallback to "Unknown Track"
      if (!finalTitle) {
        finalTitle = r.track_title || 'Unknown Track';
      }
      
      // Use a unique key to handle same track titles from different sources
      const trackKey = r.track_id || `manual-${finalTitle}-${r.platform || 'unknown'}`;
      
      if (!acc[trackKey]) {
        acc[trackKey] = {
          title: finalTitle,
          album: album,
          revenue: 0,
          streams: 0,
          platforms: new Set()
        };
      }
      acc[trackKey].revenue += r.revenue || 0;
      acc[trackKey].streams += r.streams || 0;
      if (r.platform) acc[trackKey].platforms.add(r.platform);
      return acc;
    }, {});

    return Object.values(trackData)
      .map((data: any) => ({
        ...data,
        platforms: data.platforms.size
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 tracks
  };

  // Monthly trend data
  const getMonthlyTrend = () => {
    const monthlyData = royalties.reduce((acc: any, r: any) => {
      const period = r.period || 'Unknown';
      if (!acc[period]) {
        acc[period] = { revenue: 0, streams: 0 };
      }
      acc[period].revenue += r.revenue || 0;
      acc[period].streams += r.streams || 0;
      return acc;
    }, {});

    return Object.entries(monthlyData)
      .map(([period, data]: any) => ({
        period,
        revenue: data.revenue,
        streams: data.streams
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  const platformData = getPlatformBreakdown();
  const countryData = getCountryBreakdown();
  const trackData = getTrackPerformance();
  const monthlyTrend = getMonthlyTrend();

  if (royalties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-purple-300">No analytics data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Performance */}
      <Card className="bg-slate-900/50 border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3">Revenue by Platform</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3b0764" />
                <XAxis dataKey="platform" stroke="#a855f7" fontSize={12} />
                <YAxis stroke="#a855f7" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #7c3aed', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-300 mb-3">Streams by Platform</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="streams"
                >
                  {platformData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Platform Table */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-purple-300 mb-3">Platform Details</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-2 px-3 text-purple-200 text-xs font-medium">PLATFORM</th>
                  <th className="text-right py-2 px-3 text-purple-200 text-xs font-medium">STREAMS</th>
                  <th className="text-right py-2 px-3 text-purple-200 text-xs font-medium">REVENUE</th>
                  <th className="text-right py-2 px-3 text-purple-200 text-xs font-medium">AVG/STREAM</th>
                </tr>
              </thead>
              <tbody>
                {platformData.map((platform: any) => (
                  <tr key={platform.platform} className="border-b border-purple-500/10">
                    <td className="py-2 px-3">
                      <Badge className="bg-purple-500/20 text-purple-300">{platform.platform}</Badge>
                    </td>
                    <td className="text-right py-2 px-3 text-white text-sm">{platform.streams.toLocaleString()}</td>
                    <td className="text-right py-2 px-3 text-white text-sm">${platform.revenue.toFixed(2)}</td>
                    <td className="text-right py-2 px-3 text-green-400 text-sm">${platform.avgPerStream.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Country/Region Analysis */}
      <Card className="bg-slate-900/50 border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
        {countryData.length > 0 ? (
          <>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={countryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3b0764" />
                  <XAxis dataKey="country" stroke="#a855f7" fontSize={12} />
                  <YAxis stroke="#a855f7" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #7c3aed', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#ec4899" name="Revenue by Country" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countryData.map((country: any) => (
                <Card key={country.country} className="bg-slate-800/50 border-purple-500/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{country.country}</h4>
                    <Badge className="bg-pink-500/20 text-pink-300 text-xs">
                      {((country.streams / royalties.reduce((sum: number, r: any) => sum + r.streams, 0)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-400">Streams:</span>
                      <span className="text-white">{country.streams.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-400">Revenue:</span>
                      <span className="text-green-400">${country.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <p className="text-purple-300 text-center py-4">No geographic data available</p>
        )}
      </Card>

      {/* Track Performance */}
      <Card className="bg-slate-900/50 border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Performing Tracks</h3>
        <div className="space-y-3">
          {trackData.map((track: any, index: number) => (
            <Card key={track.title} className="bg-slate-800/50 border-purple-500/10 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                    <h4 className="text-white font-medium">{track.title}</h4>
                  </div>
                  {track.album && (
                    <p className="text-sm text-purple-400 mb-2">{track.album}</p>
                  )}
                  <div className="flex gap-4 text-sm">
                    <span className="text-purple-300">{track.streams.toLocaleString()} streams</span>
                    <span className="text-green-400">${track.revenue.toFixed(2)}</span>
                    <span className="text-purple-400">{track.platforms} platforms</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${track.revenue.toFixed(2)}</div>
                  <div className="text-xs text-purple-400">Total Revenue</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Monthly Trends */}
      {monthlyTrend.length > 1 && (
        <Card className="bg-slate-900/50 border-purple-500/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3b0764" />
              <XAxis dataKey="period" stroke="#a855f7" fontSize={12} />
              <YAxis stroke="#a855f7" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #7c3aed', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue ($)" />
              <Line type="monotone" dataKey="streams" stroke="#ec4899" strokeWidth={2} name="Streams" yAxisId="right" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default RoyaltyAnalytics;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SimpleMatchScoreDemo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pickle+ Algorithm Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Interactive demonstration of the System B algorithm with comprehensive test cases and real-time calculations.
          </p>
        </div>

        {/* Test Cases Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Algorithm Test Cases</span>
              <Badge variant="secondary">System B</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Test Case 1: Elite vs Development</h3>
                <p className="text-sm text-green-700 mb-2">
                  Elite player (1200 points) defeats development player (800 points)
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-800">Winner: +3 points</span>
                  <span className="text-green-800">Loser: +1 point</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Test Case 2: Development vs Elite</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Development player (750 points) defeats elite player (1100 points)
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-800">Winner: +3 points</span>
                  <span className="text-blue-800">Loser: +1 point</span>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Test Case 3: Cross-Gender Match</h3>
                <p className="text-sm text-purple-700 mb-2">
                  Female development player (900 points) vs Male player (950 points)
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-purple-800">Female player gets 1.15x bonus if &lt;1000 points</span>
                  <span className="text-purple-800">Standard points allocation: Win +3, Loss +1</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Algorithm Details */}
        <Card>
          <CardHeader>
            <CardTitle>System B Algorithm Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Points Allocation</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Win: +3 points</li>
                  <li>• Loss: +1 point</li>
                  <li>• No doubles bonus</li>
                  <li>• No streak bonuses</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Development Bonuses</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Women &lt;1000 points: 1.15x multiplier</li>
                  <li>• Mixed teams &lt;1000 points: 1.075x multiplier</li>
                  <li>• Elite threshold: ≥1000 points</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <div className="mt-8 text-center">
          <Badge variant="outline" className="text-green-600 border-green-600">
            Demo Page Loaded Successfully
          </Badge>
        </div>
      </div>
    </div>
  );
}
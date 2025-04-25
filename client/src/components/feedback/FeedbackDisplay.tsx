/**
 * PKL-278651-SAGE-0010-FEEDBACK - Feedback Display Component
 * 
 * This component displays feedback and analytics for a specific item
 * such as a drill, training plan, or SAGE conversation.
 */

import React, { useState } from "react";
import { useFeedback, FeedbackItem, FeedbackAnalytics } from "@/hooks/use-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageCircle, TrendingUp, AlertCircle, ThumbsUp, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { FeedbackForm } from "./FeedbackForm";

interface FeedbackDisplayProps {
  itemType: 'drill' | 'training_plan' | 'sage_conversation' | 'video';
  itemId: number;
  itemName: string;
}

export function FeedbackDisplay({ itemType, itemId, itemName }: FeedbackDisplayProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  const { getFeedback, getAnalytics } = useFeedback();
  
  const { 
    data: feedbackData,
    isLoading: isLoadingFeedback,
    isError: isErrorFeedback,
    error: feedbackError
  } = getFeedback(itemType, itemId, { 
    limit: pageSize, 
    offset: (currentPage - 1) * pageSize 
  });
  
  const { 
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
    error: analyticsError
  } = getAnalytics(itemType, itemId);
  
  // Handle pagination
  const totalPages = feedbackData?.total 
    ? Math.ceil(feedbackData.total / pageSize) 
    : 1;
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div className="space-y-6">
      {showFeedbackForm ? (
        <FeedbackForm
          itemType={itemType}
          itemId={itemId}
          itemName={itemName}
          onSuccess={() => setShowFeedbackForm(false)}
          onCancel={() => setShowFeedbackForm(false)}
          includeContext={true}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Feedback & Ratings</h2>
            <Button onClick={() => setShowFeedbackForm(true)}>
              Share Your Feedback
            </Button>
          </div>
          
          <Tabs defaultValue="feedback">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            {/* Feedback Tab */}
            <TabsContent value="feedback" className="mt-4">
              {isLoadingFeedback ? (
                <div className="flex justify-center py-8">
                  <p>Loading feedback...</p>
                </div>
              ) : isErrorFeedback ? (
                <div className="flex justify-center py-8">
                  <p className="text-destructive">Error loading feedback: {feedbackError?.message}</p>
                </div>
              ) : feedbackData?.data?.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share your thoughts about this {itemType.replace('_', ' ')}.
                  </p>
                  <Button onClick={() => setShowFeedbackForm(true)}>
                    Share Your Feedback
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    {feedbackData?.data?.map((feedback: FeedbackItem) => (
                      <FeedbackCard key={feedback.id} feedback={feedback} />
                    ))}
                  </ScrollArea>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={prevPage} 
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        onClick={nextPage} 
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-4">
              {isLoadingAnalytics ? (
                <div className="flex justify-center py-8">
                  <p>Loading analytics...</p>
                </div>
              ) : isErrorAnalytics ? (
                <div className="flex justify-center py-8">
                  <p className="text-destructive">Error loading analytics: {analyticsError?.message}</p>
                </div>
              ) : !analyticsData?.data?.feedbackCount ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No analytics available</h3>
                  <p className="text-muted-foreground mb-4">
                    Analytics will be generated once feedback is submitted.
                  </p>
                  <Button onClick={() => setShowFeedbackForm(true)}>
                    Share Your Feedback
                  </Button>
                </div>
              ) : (
                <AnalyticsDisplay analytics={analyticsData.data} />
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// Feedback Card Component
interface FeedbackCardProps {
  feedback: FeedbackItem;
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
  // Get initials for avatar
  const getInitials = (userId: number) => {
    // In a real implementation, would fetch user's name
    return `U${userId}`;
  };

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return format(date, 'MMM d, yyyy');
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{getInitials(feedback.userId)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">User {feedback.userId}</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(feedback.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {feedback.overallRating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-primary fill-primary mr-1" />
                <span>{feedback.overallRating}</span>
              </div>
            )}
            {feedback.status && (
              <Badge 
                variant={
                  feedback.status === 'implemented' ? 'default' :
                  feedback.status === 'reviewed' ? 'secondary' :
                  feedback.status === 'declined' ? 'destructive' : 
                  'outline'
                }
                className="ml-2"
              >
                {feedback.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {feedback.clarityRating && (
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Clarity:</span>
              <span>{feedback.clarityRating}/5</span>
            </div>
          )}
          {feedback.difficultyRating && (
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Difficulty:</span>
              <span>{feedback.difficultyRating}/5</span>
            </div>
          )}
          {feedback.enjoymentRating && (
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Enjoyment:</span>
              <span>{feedback.enjoymentRating}/5</span>
            </div>
          )}
          {feedback.effectivenessRating && (
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Effectiveness:</span>
              <span>{feedback.effectivenessRating}/5</span>
            </div>
          )}
        </div>
        
        {feedback.positiveFeedback && (
          <div className="mb-3">
            <div className="flex items-center text-sm font-medium mb-1">
              <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
              What worked well
            </div>
            <p className="text-sm">{feedback.positiveFeedback}</p>
          </div>
        )}
        
        {feedback.improvementFeedback && (
          <div className="mb-3">
            <div className="flex items-center text-sm font-medium mb-1">
              <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
              Suggestions for improvement
            </div>
            <p className="text-sm">{feedback.improvementFeedback}</p>
          </div>
        )}
        
        {feedback.specificChallenges && (
          <div className="mb-3">
            <div className="flex items-center text-sm font-medium mb-1">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              Challenges encountered
            </div>
            <p className="text-sm">{feedback.specificChallenges}</p>
          </div>
        )}
        
        {feedback.suggestions && (
          <div className="mb-3">
            <div className="flex items-center text-sm font-medium mb-1">
              <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
              Other suggestions
            </div>
            <p className="text-sm">{feedback.suggestions}</p>
          </div>
        )}
        
        {feedback.sentiment && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {feedback.keywords?.map((keyword, i) => (
                <Badge key={i} variant="outline">
                  {keyword}
                </Badge>
              ))}
              
              {feedback.sentiment && (
                <Badge variant={
                  feedback.sentiment === 'positive' ? 'default' :
                  feedback.sentiment === 'negative' ? 'destructive' :
                  feedback.sentiment === 'mixed' ? 'secondary' : 
                  'outline'
                }>
                  {feedback.sentiment}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {feedback.actionableInsights && (
          <div className="mt-3 text-xs text-muted-foreground italic">
            {feedback.actionableInsights}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Analytics Display Component
interface AnalyticsDisplayProps {
  analytics: FeedbackAnalytics;
}

function AnalyticsDisplay({ analytics }: AnalyticsDisplayProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rating Overview</CardTitle>
          <CardDescription>
            Based on {analytics.feedbackCount} feedback submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Rating */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="text-sm font-medium">Overall Rating</div>
                <div className="text-sm font-medium">
                  {analytics.averageRatings.overall ? 
                    analytics.averageRatings.overall.toFixed(1) : 'N/A'}
                </div>
              </div>
              <Progress 
                value={analytics.averageRatings.overall ? 
                  (analytics.averageRatings.overall / 5) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            {/* Clarity Rating */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="text-sm">Clarity</div>
                <div className="text-sm">
                  {analytics.averageRatings.clarity ? 
                    analytics.averageRatings.clarity.toFixed(1) : 'N/A'}
                </div>
              </div>
              <Progress 
                value={analytics.averageRatings.clarity ? 
                  (analytics.averageRatings.clarity / 5) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            {/* Difficulty Rating */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="text-sm">Difficulty</div>
                <div className="text-sm">
                  {analytics.averageRatings.difficulty ? 
                    analytics.averageRatings.difficulty.toFixed(1) : 'N/A'}
                </div>
              </div>
              <Progress 
                value={analytics.averageRatings.difficulty ? 
                  (analytics.averageRatings.difficulty / 5) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            {/* Enjoyment Rating */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="text-sm">Enjoyment</div>
                <div className="text-sm">
                  {analytics.averageRatings.enjoyment ? 
                    analytics.averageRatings.enjoyment.toFixed(1) : 'N/A'}
                </div>
              </div>
              <Progress 
                value={analytics.averageRatings.enjoyment ? 
                  (analytics.averageRatings.enjoyment / 5) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            {/* Effectiveness Rating */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="text-sm">Effectiveness</div>
                <div className="text-sm">
                  {analytics.averageRatings.effectiveness ? 
                    analytics.averageRatings.effectiveness.toFixed(1) : 'N/A'}
                </div>
              </div>
              <Progress 
                value={analytics.averageRatings.effectiveness ? 
                  (analytics.averageRatings.effectiveness / 5) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.ratingCounts)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([rating, count]) => (
                  <div key={rating} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="text-sm font-medium">{rating} star{Number(rating) !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {count} {count === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>
                    <Progress 
                      value={(count / analytics.feedbackCount) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.sentimentBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([sentiment, percentage]) => (
                  <div key={sentiment} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="capitalize text-sm font-medium">{sentiment}</div>
                      <div className="text-sm text-muted-foreground">
                        {(percentage * 100).toFixed(0)}%
                      </div>
                    </div>
                    <Progress 
                      value={percentage * 100}
                      className={`h-2 ${
                        sentiment === 'positive' ? 'bg-green-100' :
                        sentiment === 'negative' ? 'bg-red-100' :
                        sentiment === 'mixed' ? 'bg-amber-100' :
                        'bg-gray-100'
                      }`}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {analytics.lastUpdatedAt && (
        <div className="text-xs text-muted-foreground text-right">
          Last updated: {format(new Date(analytics.lastUpdatedAt), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
}
import { Fragment } from 'react'
import { Route, Switch } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import MatchRewardDemo from './pages/match-reward-demo'

export default function App() {
  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path="/" component={MatchRewardDemo} />
        </Switch>
      </QueryClientProvider>
      <Toaster />
    </Fragment>
  )
}
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { usePushNotifications } from '../hooks/usePushNotifications';

export function PushNotificationSettings() {
  const { supported, subscribed, loading, error, success, subscribe, unsubscribe, sendTest } =
    usePushNotifications();

  return (
    <Card title="Push notifications">
      {!supported ? (
        <p className="muted">Push notifications are not supported in this browser.</p>
      ) : (
        <>
          <p className="muted">
            Get notified when you add a character to your court (requires permission).
          </p>
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
          {subscribed && !error && !success && (
            <p className="form-success">Push is enabled for this browser.</p>
          )}
          <div className="push-actions">
            {!subscribed ? (
              <Button onClick={subscribe} isLoading={loading}>
                Enable push notifications
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={sendTest} isLoading={loading}>
                  Send test notification
                </Button>
                <Button variant="ghost" onClick={unsubscribe} disabled={loading}>
                  Disable
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

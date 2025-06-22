import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Page, Layout, Card, Spinner, Text, Stack } from '@shopify/polaris';
import { useAuthStore } from '../store/authStore';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      setToken(token);
      // Rediriger vers le dashboard après un court délai
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } else {
      // Si pas de token, rediriger vers l'authentification
      setTimeout(() => {
        window.location.href = '/api/auth?shop=' + searchParams.get('shop');
      }, 2000);
    }
  }, [searchParams, setToken, navigate]);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh'
          }}>
            <Card sectioned>
              <Stack vertical alignment="center" spacing="loose">
                <Spinner size="large" />
                <Text variant="headingMd" as="h2">
                  Authentification réussie
                </Text>
                <Text variant="bodyMd" as="p" color="subdued">
                  Redirection vers votre tableau de bord...
                </Text>
              </Stack>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default AuthSuccess; 
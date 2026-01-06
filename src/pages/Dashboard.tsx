import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SpaceCard } from '@/components/SpaceCard';
import { CreateSpaceDialog } from '@/components/CreateSpaceDialog';
import { useSpaces } from '@/hooks/useSpaces';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Home, Inbox } from 'lucide-react';
import { SpaceAddress, SpaceContact } from '@/types/space';

export default function Dashboard() {
  const { spaces, isLoaded, addSpace, deleteSpace } = useSpaces();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateSpace = async (
    name: string,
    description: string,
    address?: SpaceAddress,
    contact?: SpaceContact
  ) => {
    await addSpace(name, description, address, contact);
  };

  const handleDeleteSpace = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this space? This action cannot be undone.')) {
      await deleteSpace(id);
    }
  };

  if (authLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-2">
          <Home className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Spaces</h1>
              <p className="text-muted-foreground">
                Manage your property guides and generate QR codes
              </p>
            </div>
            <CreateSpaceDialog onCreateSpace={handleCreateSpace} />
          </div>
        </motion.div>

        {spaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No spaces yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first space to start building guides for your property. 
              Add WiFi passwords, appliance instructions, and more.
            </p>
            <CreateSpaceDialog onCreateSpace={handleCreateSpace} />
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {spaces.map((space, index) => (
              <SpaceCard 
                key={space.id} 
                space={space} 
                onDelete={handleDeleteSpace}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

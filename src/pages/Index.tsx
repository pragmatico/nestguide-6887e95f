import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/FeatureCard';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  FileText, 
  Lock, 
  Smartphone, 
  Home as HomeIcon, 
  Users, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: FileText,
      title: 'Markdown Pages',
      description: 'Create beautiful, formatted guides with easy-to-use markdown. Add headings, lists, images, and more.',
    },
    {
      icon: QrCode,
      title: 'Printable QR Codes',
      description: 'Generate unique QR codes for each space. Print and place them around your property for instant access.',
    },
    {
      icon: Lock,
      title: 'Secure Access',
      description: 'Only guests with the QR code can access your guides. Keep sensitive information private.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Guides look perfect on any device. Guests can access them from their phones instantly.',
    },
    {
      icon: HomeIcon,
      title: 'Multiple Properties',
      description: 'Manage guides for multiple properties from one dashboard. Perfect for property managers.',
    },
    {
      icon: Users,
      title: 'Guest-Focused',
      description: 'Designed for the best guest experience. Clear, accessible, and always available.',
    },
  ];

  const useCases = [
    'WiFi passwords and network details',
    'Appliance instructions (dishwasher, washer, etc.)',
    'Check-in and check-out procedures',
    'Local recommendations and tips',
    'Emergency contacts and procedures',
    'House rules and guidelines',
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1" role="main">
        {/* Hero Section */}
        <section className="relative overflow-hidden hero-gradient" aria-labelledby="hero-heading">
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                  <HomeIcon className="w-4 h-4" aria-hidden="true" />
                  Welcome Guides for Properties
                </span>
              </motion.div>
              
              <motion.h1
                id="hero-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight"
              >
                Create Digital Welcome Guides for Your{' '}
                <span className="text-primary">Property</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
              >
                Help your guests feel at home with beautiful, scannable guides. 
                Create cheatsheets with WiFi info, appliance instructions, house rules, 
                and local tips — accessible instantly via QR code.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild variant="hero" size="xl">
                  <Link to="/dashboard" aria-label="Create your free property welcome guide">
                    Create Your Free Space
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="heroOutline" size="xl">
                  <a href="#features" aria-label="Learn how NestGuide works">See How It Works</a>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl" aria-hidden="true" />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" aria-hidden="true" />
        </section>

        {/* Use Cases Section */}
        <section className="py-16 md:py-24 bg-card" aria-labelledby="use-cases-heading">
          <div className="container mx-auto px-4">
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 id="use-cases-heading" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Everything Your Guests Need
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Put all the important information in one place. No more texts asking for the WiFi password!
              </p>
            </motion.header>

            <ul className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4" role="list" aria-label="Property guide use cases">
              {useCases.map((useCase, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border/50"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                  <span className="text-foreground">{useCase}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Powerful Features, Simple Experience
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to create professional property guides in minutes.
              </p>
            </motion.header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="NestGuide features">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/5" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Ready to Welcome Your Guests Better?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Create your first space for free. No credit card required.
              </p>
              <Button asChild variant="hero" size="xl">
                <Link to="/dashboard" aria-label="Start creating your property guide now">
                  Get Started Now
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

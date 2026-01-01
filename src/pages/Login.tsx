import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield, GraduationCap, Users, UserPlus, LogIn } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signup(email, password, name);
        toast({
          title: 'Account created!',
          description: 'You have successfully signed up. You can now log in.',
        });
        setIsSignUp(false);
        setPassword('');
      } else {
        await login(email, password);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      let message = 'An error occurred. Please try again.';
      
      if (error?.message) {
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('User already registered')) {
          message = 'This email is already registered. Please log in instead.';
        } else if (error.message.includes('Password should be')) {
          message = 'Password should be at least 6 characters long.';
        } else {
          message = error.message;
        }
      }
      
      toast({
        title: isSignUp ? 'Sign up failed' : 'Login failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    admin: Shield,
    staff: GraduationCap,
    parent: Users,
  };

  const roleDescriptions = {
    admin: 'Full access to manage students, staff, and settings',
    staff: 'View classes, enter results, manage students',
    parent: 'View student profile, fees, and payment options',
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero pattern-islamic relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 to-primary/80" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <img 
            src={logo} 
            alt="Minhaaj Academy" 
            className="h-32 w-auto mb-8 drop-shadow-2xl animate-fade-in"
          />
          <h1 className="text-4xl font-bold text-primary-foreground mb-4 animate-slide-up">
            Minhaaj Academy
          </h1>
          <p className="text-xl text-primary-foreground/90 font-amiri mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Faith. Foundation. Future
          </p>
          <p className="text-primary-foreground/70 mt-8 max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
            California Group of Schools (CGOS)
          </p>
          <div className="mt-12 text-primary-foreground/60 text-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <p>3rd Parklands Avenue / Kusii Lane, Nairobi</p>
            <p className="mt-1">+254 793 746 424 | minhaj@cgos.co.ke</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img 
              src={logo} 
              alt="Minhaaj Academy" 
              className="h-20 w-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground">Minhaaj Academy</h1>
            <p className="text-muted-foreground font-amiri">Faith. Foundation. Future</p>
          </div>

          <Card className="shadow-medium border-0">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Sign up to access the School Management System'
                  : 'Sign in to access the School Management System'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {!isSignUp && (
                <Tabs defaultValue="admin" className="mb-6">
                  <TabsList className="grid grid-cols-3 w-full">
                    {(['admin', 'staff', 'parent'] as const).map((role) => {
                      const Icon = roleIcons[role];
                      return (
                        <TabsTrigger key={role} value={role} className="flex items-center gap-2 capitalize">
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{role}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  {(['admin', 'staff', 'parent'] as const).map((role) => (
                    <TabsContent key={role} value={role} className="mt-4">
                      <p className="text-sm text-muted-foreground text-center">
                        {roleDescriptions[role]}
                      </p>
                    </TabsContent>
                  ))}
                </Tabs>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-primary hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setPassword('');
                    setName('');
                  }}
                  className="text-sm"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </Button>
              </div>

              {!isSignUp && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground text-center mb-2">
                    Note: New users are assigned the "Parent" role by default.
                    Contact an admin to change your role.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

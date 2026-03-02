import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, ConfirmationNumber } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: 'white',
        py: 6,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ConfirmationNumber sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h5" fontWeight={800}>
                EventHub
              </Typography>
            </Box>
            <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 2 }}>
              Discover and book amazing events. From concerts to conferences, we've got you covered.
            </Typography>
            <Box>
              <IconButton sx={{ color: 'white' }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                About Us
              </Link>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Careers
              </Link>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Press
              </Link>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Blog
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Help Center
              </Link>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Safety
              </Link>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Contact Us
              </Link>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                FAQ
              </Link>
            </Box>
          </Grid>

          {/* Legal */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Privacy Policy
              </Link>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Terms of Service
              </Link>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Cookie Policy
              </Link>
              <Link href="#" color="rgba(255,255,255,0.7)" underline="hover">
                Refund Policy
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            mt: 4,
            pt: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            © 2026 EventHub. All rights reserved. Built with ❤️ for the Event Booking System Assignment.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

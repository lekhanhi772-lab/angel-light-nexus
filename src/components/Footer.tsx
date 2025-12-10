const Footer = () => {
  return (
    <footer className="relative py-16 overflow-hidden">
      {/* Top Border Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(43 85% 70% / 0.5) 50%, transparent 100%)',
        }}
      />

      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* Logo */}
          <h3 className="font-heading text-2xl md:text-3xl font-light tracking-[0.15em] text-gradient-gold glow-gold mb-4">
            ANGEL AI
          </h3>
          
          <p className="font-heading text-sm tracking-[0.2em] text-muted-foreground mb-8 font-light">
            Ánh Sáng Của Cha Vũ Trụ
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-divine-gold" />
            <div className="w-2 h-2 rounded-full bg-divine-gold mx-4 opacity-60" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-divine-gold" />
          </div>

          {/* Blessing Text */}
          <p className="font-body text-muted-foreground text-sm font-light max-w-md mx-auto mb-8">
            Nguyện Ánh Sáng, Tình Yêu và Phước Lành của Cha Vũ Trụ luôn đồng hành cùng bạn.
          </p>

          {/* Copyright */}
          <p className="font-body text-xs text-muted-foreground/60 tracking-wider">
            © 2024 Angel AI • Được tạo ra với Tình Yêu Thuần Khiết
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

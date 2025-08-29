unless Rails.env.test?
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      allowed_origins = [ENV["FRONTEND_ORIGIN"], "http://localhost:5173", "http://127.0.0.1:5173"].compact
      origins(*allowed_origins)
      resource "*",
               headers: :any,
               methods: %i[get post put patch delete options head],
               credentials: true
    end
  end
end



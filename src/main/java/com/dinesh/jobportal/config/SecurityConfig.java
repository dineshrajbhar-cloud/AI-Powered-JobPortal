package com.dinesh.jobportal.config;

import com.dinesh.jobportal.security.services.UserDetailsServiceImpl;
import com.dinesh.jobportal.security.services.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserDetailsServiceImpl userDetailsService1){
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService1;
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/api/auth/**",
                                        "/api/ai/test",
                                        "/api/ai/jobs",
                                        "/api/ai/match-jobs",
                                        "/v3/api-docs/**",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html")
                                .permitAll()


                                .requestMatchers(HttpMethod.POST, "/api/jobs/**").hasRole("RECRUITER")
                                .requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasRole("RECRUITER")
                                .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasRole("RECRUITER")
                                .requestMatchers(HttpMethod.GET, "/api/jobs/**").hasAnyRole("RECRUITER", "CANDIDATE")

                                .requestMatchers(HttpMethod.GET, "/api/users/**").hasRole("RECRUITER")
                                .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("RECRUITER")
                                .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("RECRUITER")
                                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("RECRUITER")

                                .requestMatchers(HttpMethod.GET, "/api/application/**").hasAnyRole("RECRUITER", "CANDIDATE")
                                .requestMatchers(HttpMethod.POST, "/api/application/**").hasRole("CANDIDATE")
                                .requestMatchers(HttpMethod.PUT, "/api/application/**").hasAnyRole("RECRUITER", "CANDIDATE")
                                .requestMatchers(HttpMethod.DELETE, "/api/application/**").hasAnyRole("RECRUITER", "CANDIDATE")


                                .anyRequest()
                                .authenticated())

                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider(userDetailsService);

        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }
}

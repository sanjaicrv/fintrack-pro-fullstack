package com.budgetplanner.security;

import com.budgetplanner.entity.User;
import com.budgetplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex);
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        if (!"google".equalsIgnoreCase(registrationId)) {
            throw new OAuth2AuthenticationException("Only Google sign-in is supported");
        }

        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not found from Google");
        }

        String name = oAuth2User.getAttribute("name");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");

        if (firstName == null || firstName.isBlank()) {
            firstName = name != null && !name.isBlank() ? name : "Google";
        }
        if (lastName == null || lastName.isBlank()) {
            lastName = "User";
        }

        log.info("Processing Google OAuth2 user email: {}", email);

        Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase().trim());
        if (userOptional.isPresent()) {
            log.info("Google user already exists in database: {}", email);
        } else {
            log.info("Google user does not exist in database. Auto-registering: {}", email);
            User user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email.toLowerCase().trim())
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Secure random password since auth is external
                    .role(User.Role.USER)
                    .theme(User.Theme.LIGHT)
                    .build();
            User savedUser = userRepository.save(user);
            log.info("Google user registered successfully with ID: {}", savedUser.getId());
        }

        return oAuth2User;
    }
}

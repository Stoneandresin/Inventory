# Copilot Instructions for Inventory - AI Organizer

## Project Overview
This repository contains **Inventory**, an AI-powered organizer system. The project aims to help users organize and manage their inventory using artificial intelligence capabilities.

## Code Guidelines

### General Principles
- Write clean, maintainable, and well-documented code
- Follow established naming conventions and coding standards
- Prioritize readability and simplicity
- Use meaningful variable and function names
- Add comments for complex logic and business rules

### Architecture & Structure
- Keep the codebase modular and organized
- Separate concerns between data management, AI processing, and user interface
- Use appropriate design patterns for inventory management operations
- Maintain clear separation between configuration, business logic, and presentation layers

### AI & Machine Learning Components
- Document AI model inputs, outputs, and expected behavior
- Include error handling for AI service failures or unexpected responses
- Consider performance implications of AI operations
- Implement appropriate fallback mechanisms when AI services are unavailable

### Data Management
- Implement proper data validation for inventory items
- Use appropriate data structures for inventory operations (search, filter, sort)
- Consider data persistence and backup strategies
- Ensure data integrity and consistency

### Error Handling
- Implement comprehensive error handling throughout the application
- Provide meaningful error messages for users
- Log errors appropriately for debugging
- Handle edge cases gracefully

### Testing
- Write unit tests for core functionality
- Include integration tests for AI components
- Test edge cases and error conditions
- Maintain good test coverage for critical paths

### Documentation
- Keep README.md updated with current project status
- Document API endpoints and data schemas if applicable
- Include setup and installation instructions
- Provide usage examples and common workflows

### Performance
- Consider scalability for large inventory datasets
- Optimize AI operations to minimize response times
- Implement appropriate caching strategies
- Monitor resource usage and performance metrics

## Development Workflow
- Create feature branches for new functionality
- Write tests before implementing features (TDD when appropriate)
- Ensure all tests pass before committing
- Keep commits focused and atomic
- Write clear commit messages describing the changes

## AI Organizer Specific Guidelines

### Inventory Item Management
- Ensure consistent data structure for inventory items
- Implement proper categorization and tagging systems
- Support various item types and attributes
- Handle item relationships and dependencies

### AI Integration
- Maintain clear interfaces between AI services and core application
- Handle AI response parsing and validation
- Implement rate limiting and quota management for AI services
- Consider offline functionality when AI services are unavailable

### User Experience
- Provide intuitive interfaces for inventory management
- Implement search and filtering capabilities
- Ensure responsive design for various devices
- Include helpful tooltips and guidance for AI features

## Security Considerations
- Validate all user inputs
- Implement appropriate authentication and authorization
- Protect sensitive inventory data
- Follow security best practices for AI service integration

## Dependencies and Libraries
- Keep dependencies up to date and secure
- Document the purpose of each major dependency
- Consider the impact of new dependencies on project size and complexity
- Prefer well-maintained and popular libraries

## Contribution Guidelines
- Follow the existing code style and patterns
- Update documentation when adding new features
- Include appropriate tests with new functionality
- Consider backward compatibility when making changes

These instructions should guide all development work on the Inventory AI organizer project, ensuring consistency, quality, and maintainability.